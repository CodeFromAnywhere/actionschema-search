import { groqChatCompletion } from "../../src/groqChatCompletion.js";

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
    const { error, result: contentBig } = await groqChatCompletion({
      GROQ_API_KEY,
      model: "llama-3.1-70b-versatile",
      message: `Extract actions from this query: \n\n----QUERY--------\n\n${q}\n\n-----END QUERY-------`,
      system: `You are an AI assistant that extracts API action(s) from the user query and returns them. 

      Respond in structured JSON format with the following structure: 
      
      {
        /** 
         * Only make it an action if it's likely to be possible to be using some sort of API. 
         * Omit general query segments such as 'i want to make an app' or 'i have an idea'
         */
        actions: Array<{
        /** Always take the biggest segment of the query that fits to one action possible */
        querySegment:string,
        /** 
         * The action description should include information about desired functionality, not input details.
         * Also it must mention service providers, if specified.
         */
        actionDescription:string
      }> }`,
    });

    if (!contentBig) {
      throw new Error(error);
    }

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
