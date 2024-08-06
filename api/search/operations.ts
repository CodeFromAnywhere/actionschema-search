import { notEmpty } from "from-anywhere";
import { client } from "../../src/sdk/client.js";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const providerSlug = url.searchParams.get("providerSlug");
  const providers = await fetch(url.origin + "/providers.json").then((res) =>
    res.json(),
  );
  if (!q || !providerSlug) {
    return new Response("Please provide q and providerSlug", { status: 422 });
  }

  const provider = providers[providerSlug];
  if (!provider || !provider.openapiUrl) {
    return new Response("Provider not found", { status: 422 });
  }

  const summary = await client.search("summarizeOpenapi", {
    openapiUrl: provider.openapiUrl,
  });

  const operations = summary["application/json"]
    ?.map((x) =>
      x.operations?.map((op) => ({
        ...op,
        tag: x.name,
        tagDescription: x.description,
      })),
    )
    .filter(notEmpty)
    .flat();

  // TODO: the openapi url, get openapi summary and get semantic similarity per operation summary, then 1 boolaen yes/no by a fast and smart groq LLM (405b?). sort on relevancy

  return new Response(JSON.stringify({ operations }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
