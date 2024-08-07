export const GET = async (request) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const providers = await fetch(url.origin + "/providers.json").then((res) => res.json());
    const keys = !q
        ? Object.keys(providers)
        : Object.keys(providers).filter((x) => x.toLowerCase().includes(q.toLowerCase()));
    const result = keys.reduce((obj, key) => ({ ...obj, [key]: providers[key] }), {});
    return new Response(JSON.stringify({ result, createdAt: Date.now(), version: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
//# sourceMappingURL=providers.js.map