import { tryParseJson } from "from-anywhere";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  let json;
  let text;
  if (q) {
    text = await fetch(
      url.origin + `/api/audio/actionmap?q=${encodeURIComponent(q)}`,
    ).then((res) => res.text());
    json = tryParseJson<any>(text);
  }
  console.log({ text, json });

  const providers = await fetch(url.origin + "/providers.json").then((res) =>
    res.json(),
  );
  const keys = !q
    ? Object.keys(providers)
    : Object.keys(providers).filter((x) =>
        x.toLowerCase().includes(q.toLowerCase()),
      );

  const result = keys.reduce(
    (obj, key) => ({ ...obj, [key]: providers[key] }),
    {},
  );

  return new Response(
    JSON.stringify({ result, createdAt: Date.now(), version: 1, text, json }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
