import { tryParseJson } from "from-anywhere";

export const DEFAULT_MODEL = "gemma2-9b-it"; //15k tpm and 30 rpm

// best at json but 5000 tokens per minute : "mixtral-8x7b-32768";
// big and 130k tpm and 100 qpm... and  but slow + expensive "llama-3.1-70b-versatile";

export const groqChatCompletion = async (context: {
  GROQ_API_KEY: string;
  model?: string;
  system: string;
  message: string;
}) => {
  const { GROQ_API_KEY, message, model, system } = context;

  const messages = [
    { role: "system", content: system },
    { role: "user", content: message },
  ];
  console.log("GROQ CALL:", messages);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL, // You can change this to another supported model
        messages,
        response_format: { type: "json_object" },
      }),
    },
  );

  const json = await response.json();
  //console.log({ json });

  if (!response.ok) {
    return {
      result: undefined,
      error: `HTTP error! status: ${response.status} with JSON: ${JSON.stringify(json)}`,
    };
  }

  // always a string, but sometimes can be a string that is parseable as the JSON requested
  const content = json.choices[0]?.message?.content as string | undefined;

  if (!content || !tryParseJson(content)) {
    console.log(`GROQ ERROR:`, json);
    return {
      result: undefined,
      error: `LLM didn't respond with an object... ${content}`,
    };
  }

  console.log(`GROQ JSON:`, tryParseJson(content));

  return { result: content, error: undefined };
};
