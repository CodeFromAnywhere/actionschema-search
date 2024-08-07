import { notEmpty, tryParseJson } from "from-anywhere";
import { client } from "./sdk/client.js";
import { groqChatCompletion } from "./groqChatCompletion.js";

export const getOperationsForAction = async (context: {
  providerSlug: string;
  actionDescription: string;
  origin: string;
  GROQ_API_KEY: string;
}) => {
  const { providerSlug, origin, GROQ_API_KEY, actionDescription } = context;

  const providers = await fetch(origin + "/providers.json").then((res) =>
    res.json(),
  );

  const provider = providers[providerSlug];
  if (!provider || !provider.openapiUrl) {
    return;
  }

  const operations = await client.search("summarizeOpenapi", {
    openapiUrl: provider.openapiUrl,
  });

  const summaryString = operations["application/json"]
    ?.map(({ name, description, operations }) => {
      return `${name}${description}\n${operations
        ?.map((item) => {
          return `- ${item.operationId} - ${item.operation?.summary}`;
        })
        .join("\n")}`;
    })
    .filter(notEmpty)
    .join("\n\n");

  const groqOperationArrayString = await groqChatCompletion({
    GROQ_API_KEY,
    system: `Consider the api of ${providerSlug} with the following summary, and determine the relevant operationIds for performing the users action.
    
    
${summaryString}

Respond with an array of most likely relevant operations in JSON with the following format:

{ operations: {
  operationId:string,
  /** number between 0-1 */
  likelihood:number
}[] }`,
    message: `Action: ${actionDescription}`,
  });

  const sorted = tryParseJson<{
    operations: { operationId: string; likelihood: number }[];
  }>(groqOperationArrayString)?.operations?.sort(
    (a, b) => b.likelihood - a.likelihood,
  );

  return { operations: sorted };
};
