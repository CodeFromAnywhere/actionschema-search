import { tryParseJson } from "from-anywhere";

const llmActionmap = async (GROQ_API_KEY: string, q: string, model: string) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model, // You can change this to another supported model
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that extracts API action(s) from the user query and returns them. 

Please note: 
- Always take the biggest segment of the query that fits to one action possible.
- The action description should include information about desired functionality, not input details. 
- Only make it an action if it's likely to be possible to be using some sort of API
- Omit general query segments such as 'i want to make an app' or 'i have an idea'

Respond in structured JSON format with the following structure: { actions: Array<{querySegment:string,actionDescription:string, specifiedProviders: string[]|null}> }`,
          },
          {
            role: "user",
            content: `Extract actions from this query: \n\n----QUERY--------\n\n${q}\n\n-----END QUERY-------`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    },
  );

  const json = await response.json();
  //console.log({ json });

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status} with JSON: ${JSON.stringify(json)}`,
    );
  }

  // always a string, but sometimes can be a string that is parseable as the JSON requested
  const content = json.choices[0].message.content as string;

  if (!tryParseJson(content)) {
    throw new Error(`LLM didn't respond with an object... ${content}`);
  }

  return content;
};
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
    // const content = await llmActionmap(GROQ_API_KEY, q, "mixtral-8x7b-32768");

    //to test other models:
    const contentBig = await llmActionmap(
      GROQ_API_KEY,
      q,
      "llama-3.1-70b-versatile",
    );

    // console.dir(
    //   {
    //     content: tryParseJson(content),
    //        content405b: tryParseJson(content405b),
    //   },
    //   { depth: 19 },
    // );
    return new Response(contentBig, {
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
