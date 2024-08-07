import { tryParseJson } from "from-anywhere";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q) {
    return new Response(
      JSON.stringify({ error: "Query parameter 'q' is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768", // You can change this to another supported model
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that extracts actions from user queries and returns them in a structured JSON format with the following structure: { actions: {segment:string,actionDescription:string}[] }",
            },
            { role: "user", content: `Extract actions from this query: ${q}` },
          ],
          temperature: 0.7,
          max_tokens: 150,
          response_format: { type: "json_object" },
        }),
      },
    );
    const json = await response.json();
    console.log({ json });
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} with JSON: ${JSON.stringify(json)}`,
      );
    }

    // always a string, but sometimes can be a string that is parseable as the JSON requested
    const content = json.choices[0].message.content;

    if (!tryParseJson(content)) {
      throw new Error(`LLM didn't respond with an object... ${content}`);
    }

    return new Response(content, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    return new Response(
      JSON.stringify({
        error:
          "An error occurred while processing your request" + error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
