import { notEmpty, onlyUnique2, tryParseJson } from "from-anywhere";
import { groqChatCompletion } from "../../src/groqChatCompletion.js";
import { getOperationsForAction } from "../../src/getOperationsForAction.js";

type ActionMap = {
  actions: { querySegment: string; actionDescription: string }[];
};

/**

The main issue with 'providers' is the amount of LLM calls now, hitting the ratelimit and timelimit quickly.

It performs the following steps:
- Determine actions: 1x ===> n actions
- Determine providers: n ===> p providers
- Determine operations: n*p ====> n*p*o operations

Example: If there are 4 actions, and ~2 providers per action:
- it will do 13 queries. 
- chain length is 3 llm calls
- Some queries may already be in the thousands of tokens

The cost of 1 such query is already fairly high, but worth it considering the value it brings, if we find a good way to charge for it.


 */
export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  // could be specified by user, but its better to hide as much complexity as possible and do it intelligently. we can simply ask an llm: has this text multiple actions or just 1? is it good enough according to these examples?
  // TODO: turn this on again after we have a better ratelimit!
  const useActionMap = false; // q?.length ? q.length > 100 : false;

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response =
    useActionMap && q
      ? await fetch(
          url.origin + `/api/search/actionmap?q=${encodeURIComponent(q)}`,
        ).then((res) => res.text())
      : undefined;

  const actionMap: ActionMap | null =
    useActionMap && q && response
      ? tryParseJson<ActionMap>(response)
      : { actions: q ? [{ querySegment: q, actionDescription: q }] : [] };

  if (!actionMap || !actionMap.actions) {
    return new Response(`ActionMap went wrong: ${response}`, { status: 500 });
  }

  const providers = await fetch(url.origin + "/providers.json").then((res) =>
    res.json(),
  );

  const providersList = Object.entries<{ description?: string }>(providers)
    .map(([providerSlug, item]) => {
      return `- ${providerSlug}${item.description ? `: ${item.description}` : ""}`;
    })
    .join("\n");

  const actions = (
    await Promise.all(
      actionMap.actions.map(async (item) => {
        const system = `Which provider or providers are likely suitable for the users action?

Available providers (format is {slug}: {description}):

${providersList}

Respond with a JSON in the format { "providerSlugs": string[]}

If there are no suitable providers, respond with an empty array in providerSlugs.`;

        const message = `Action: '${item.actionDescription}'`;
        const { result: response, error } = await groqChatCompletion({
          GROQ_API_KEY,
          system,
          message,
        });

        if (!response) {
          console.log(`error groq:`, error);
          return;
        }

        const result = tryParseJson<{ providerSlugs: string[] }>(response);
        const PROVIDERS_LIMIT = 2;

        const providersArray = result?.providerSlugs.slice(0, PROVIDERS_LIMIT)
          ? (
              await Promise.all(
                result.providerSlugs.map(async (providerSlug) => {
                  const operations = await getOperationsForAction({
                    actionDescription: item.actionDescription,
                    GROQ_API_KEY,
                    origin: url.origin,
                    providerSlug,
                  });
                  if (!operations?.operations) {
                    return;
                  }

                  return {
                    providerSlug,
                    operations: operations?.operations.map((item) => {
                      const operationSummary = operations.summary?.find(
                        (x) => x.operationId === item.operationId,
                      );

                      const openapiUrl = operationSummary?.openapiUrl;

                      const referenceUrl =
                        openapiUrl && item.operationId
                          ? `reference.html?openapiUrl=${openapiUrl}#/operations/${item.operationId}`
                          : undefined;
                      const loginUrl = `https://auth.actionschema.com/provider/authorize?providerSlug=${providerSlug}&redirect_uri=${encodeURIComponent(`https://actionschema.com/search.html${q ? `?q=${q}` : ""}`)}&selectScopes=1`;
                      const prunedOpenapiUrl =
                        openapiUrl && operationSummary.operationId
                          ? `https://openapi-util.actionschema.com/pruneOpenapi?openapiUrl=${openapiUrl}&operationIds=${operationSummary?.operationId}&dereference=true`
                          : undefined;
                      const buildUrl = prunedOpenapiUrl
                        ? `https://eval.actionschema.com/new.html?context=${encodeURIComponent(prunedOpenapiUrl)}&q=Please+build+me+a+Vercel+serverless+endpoint+that+uses+this&send=false`
                        : undefined;
                      const providerUrl = `https://actionschema.com/apps/${providerSlug}/integrations`;

                      return {
                        ...item,
                        openapiUrl,
                        providerUrl,
                        referenceUrl,
                        loginUrl,
                        prunedOpenapiUrl,
                        buildUrl,
                        summary: operationSummary?.operation?.summary,
                      };
                    }),
                    provider: providers[providerSlug],
                  };
                }),
              )
            ).filter(notEmpty)
          : undefined;

        const final = {
          ...item,
          // providerSlugs: result?.providerSlugs,
          providers: providersArray,
          error: !result?.providerSlugs ? response : undefined,
        };

        return final;
      }),
    )
  ).filter(notEmpty);

  // map it from providers per action to oas/operationIds and actions per operation

  const uniqueOperations = actions
    .map((item) =>
      item.providers?.map((n) =>
        n.operations.map((x) => {
          return { providerSlug: n.providerSlug, operationId: x.operationId };
        }),
      ),
    )

    .flat(2)
    .filter(notEmpty)
    .filter(
      onlyUnique2<{ providerSlug: string; operationId: string }>(
        (a, b) =>
          a.operationId === b.operationId && a.providerSlug === b.providerSlug,
      ),
    );

  const operations = uniqueOperations.map((o) => {
    const a = actions
      .map((x) => {
        const perProvider = x.providers
          ?.map((item) => {
            const operationItem = item.operations.find(
              (x) =>
                x.operationId === o.operationId &&
                item.providerSlug === o.providerSlug,
            );
            if (!operationItem) {
              return;
            }
            return {
              providerSlug: item.providerSlug,
              ...operationItem,
              provider: item.provider,
            };
          })
          .filter(notEmpty);

        return perProvider?.map((k) => ({
          querySegment: x.querySegment,
          actionDescription: x.actionDescription,
          ...k,
        }));
      })
      .filter(notEmpty)
      .flat();

    const {
      operationId,
      providerSlug,
      provider,
      summary,
      buildUrl,
      loginUrl,
      openapiUrl,
      referenceUrl,
      prunedOpenapiUrl,
      providerUrl,
    } = a[0];

    return {
      operationId,
      providerSlug,
      provider,
      summary,
      buildUrl,
      loginUrl,
      openapiUrl,
      referenceUrl,
      prunedOpenapiUrl,
      providerUrl,
      actions: a.map(
        ({
          provider,
          providerSlug,
          operationId,
          summary,
          buildUrl,
          loginUrl,
          openapiUrl,
          referenceUrl,
          prunedOpenapiUrl,
          providerUrl,
          ...rest
        }) => rest,
      ),
    };
  });

  const json = {
    actions,
    operations,
    query: q,
    createdAt: Date.now(),
    version: 1,
  };

  return new Response(JSON.stringify(json), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
