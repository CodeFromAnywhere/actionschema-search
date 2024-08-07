import { notEmpty, tryParseJson } from "from-anywhere";
import { groqChatCompletion } from "../../src/groqChatCompletion.js";
import { getOperationsForAction } from "../../src/getOperationsForAction.js";
export const GET = async (request) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    // could be specified by user, but its better to hide as much complexity as possible and do it intelligently. we can simply ask an llm: has this text multiple actions or just 1? is it good enough according to these examples?
    const useActionMap = q?.length ? q.length > 100 : false;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return new Response(JSON.stringify({ error: "GROQ_API_KEY is not set" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    const response = useActionMap && q
        ? await fetch(url.origin + `/api/audio/actionmap?q=${encodeURIComponent(q)}`).then((res) => res.text())
        : undefined;
    const actionMap = useActionMap && q && response
        ? tryParseJson(response)
        : { actions: q ? [{ segment: q, actionDescription: q }] : [] };
    if (!actionMap) {
        return new Response(`ActionMap went wrong: ${response}`, { status: 500 });
    }
    const providers = await fetch(url.origin + "/providers.json").then((res) => res.json());
    const providersList = Object.entries(providers)
        .map(([providerSlug, item]) => {
        return `- ${providerSlug}${item.description ? `: ${item.description}` : ""}`;
    })
        .join("\n");
    const providersPerAction = await Promise.all(actionMap.actions.map(async (item) => {
        const system = `Which provider or providers are likely suitable for the users action?

Available providers:

${providersList}


Respond with a JSON in the format { providerSlugs: string[]}'`;
        const message = `Action: '${item.actionDescription}'`;
        const response = await groqChatCompletion({
            GROQ_API_KEY,
            system,
            message,
        });
        const result = tryParseJson(response);
        const providerOperations = result?.providerSlugs
            ? (await Promise.all(result.providerSlugs.map(async (providerSlug) => {
                const operations = await getOperationsForAction({
                    actionDescription: item.actionDescription,
                    GROQ_API_KEY,
                    origin: url.origin,
                    providerSlug,
                });
                if (!operations?.operations) {
                    return;
                }
                return { providerSlug, operations: operations?.operations };
            }))).filter(notEmpty)
            : undefined;
        return {
            ...item,
            providerSlugs: result?.providerSlugs,
            providerOperations,
            error: !result?.providerSlugs ? response : undefined,
        };
    }));
    return new Response(JSON.stringify({ providersPerAction, createdAt: Date.now(), version: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
//# sourceMappingURL=providers.js.map