export const POST = async (request) => {
    try {
        const groqSecret = process.env.GROQ_API_KEY;
        // Get the audio file from the request
        const formData = await request.formData();
        const audioFile = formData.get("file");
        if (!audioFile) {
            return new Response("No audio file provided", { status: 400 });
        }
        // Prepare the form data for the OpenAI API request
        const apiFormData = new FormData();
        apiFormData.append("file", audioFile);
        apiFormData.append("model", "whisper-large-v3");
        // Make a request to the OpenAI API
        const response = await fetch("https://api.groq.com/openai/v1/audio/translations", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${groqSecret}`,
            },
            body: apiFormData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API request failed with status ${response.status} and json ${JSON.stringify(error)}`);
        }
        const result = await response.json();
        // Return the transcribed text
        return new Response(JSON.stringify({ transcript: result.text }), {
            headers: { "Content-Type": "application/json" },
        });
    }
    catch (error) {
        console.error("Error processing audio:", error);
        return new Response("Error processing audio", { status: 500 });
    }
};
//# sourceMappingURL=translations.js.map