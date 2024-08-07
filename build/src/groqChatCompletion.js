import { tryParseJson } from "from-anywhere";
export const DEFAULT_MODEL = "llama-3.1-70b-versatile";
export const groqChatCompletion = async (context) => {
    const { GROQ_API_KEY, message, model, system } = context;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: model || DEFAULT_MODEL, // You can change this to another supported model
            messages: [
                { role: "system", content: system },
                { role: "user", content: message },
            ],
            response_format: { type: "json_object" },
        }),
    });
    const json = await response.json();
    //console.log({ json });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} with JSON: ${JSON.stringify(json)}`);
    }
    // always a string, but sometimes can be a string that is parseable as the JSON requested
    const content = json.choices[0].message.content;
    if (!tryParseJson(content)) {
        throw new Error(`LLM didn't respond with an object... ${content}`);
    }
    return content;
};
//# sourceMappingURL=groqChatCompletion.js.map