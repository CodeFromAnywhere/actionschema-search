import { tryParseJson } from "from-anywhere";
import { groqChatCompletion } from "../../src/groqChatCompletion.js";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const message = url.searchParams.get("message");
  const system = url.searchParams.get("system");
  if (!message) {
    return new Response("Please provide a message", { status: 422 });
  }
  if (!process.env.GROQ_API_KEY) {
    return new Response("GROQ_API_KEY must be set", { status: 422 });
  }

  const jsonString = await groqChatCompletion({
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    message,
    system,
    responseFormatType: "json_object",
  });

  if (!jsonString.result) {
    return new Response("Could not get chat completion", {
      status: 500,
      statusText: jsonString.error,
    });
  }

  const maybeJson = tryParseJson(jsonString.result);
  if (!maybeJson) {
    return new Response("Result couldn't be parsed: " + jsonString.result, {
      status: 500,
      statusText: jsonString.error,
    });
  }

  return new Response(jsonString.result, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
