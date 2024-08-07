import { notEmpty, onlyUnique2, tryParseJson } from "from-anywhere";
import { client } from "./sdk/client.js";
import { groqChatCompletion } from "./groqChatCompletion.js";
import { JSONSchema7 } from "json-schema";

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
    console.log(`providerSlug ${providerSlug} has no openapi`);
    return;
  }

  const response = await fetch(
    `${origin}/api/search/summarizeOpenapi?openapiUrl=${provider.openapiUrl}`,
  ).then((res) => res.text());

  type Summary = {
    tag: string;
    tagDescription: string;
    openapiUrl: string;
    operationId: string;
    summary?: string;
  }[];

  const json = tryParseJson<Summary>(response);
  if (!json) {
    console.log(`failed summarizing ${providerSlug}`);
    return;
  }

  const summaryString = json
    .map((x) => x.tag)
    .filter(onlyUnique2())
    .map((tag) => {
      return `${tag}:
    
${json
  .filter((x) => x.tag === tag)
  .map(({ operationId, summary }) => {
    return `- ${operationId} - ${summary || ""}`;
  })
  .join("\n")}`;
    })
    .join("\n\n");

  console.log("summary", summaryString);
  const { result: groqOperationArrayString, error } = await groqChatCompletion({
    GROQ_API_KEY,
    system: `Consider the api of ${providerSlug} with the following summary, and determine the relevant operationIds for performing the users action.
    
    
${summaryString}

Respond with an array of most likely relevant operations in JSON with the following format:

\`\`\`json
{ 
  "operations": Array<{
    "operationId": string,
    //number between 0 and 1
    "likelihood":number
  }>
}
\`\`\``,
    message: `Action: ${actionDescription}`,
  });

  if (!groqOperationArrayString) {
    console.log(`error groq:${error}`);
    return { operations: [] };
  }

  const sorted = tryParseJson<{
    operations: { operationId: string; likelihood: number }[];
  }>(groqOperationArrayString)?.operations?.sort(
    (a, b) => b.likelihood - a.likelihood,
  );

  return { operations: sorted };
};
