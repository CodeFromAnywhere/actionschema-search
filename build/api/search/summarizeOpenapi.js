import { notEmpty, onlyUnique2 } from "from-anywhere";
import { getOperations, fetchOpenapi } from "openapi-util";
/**
Serverless function to get all operationId/summary pairs for any openapi in text or json
*/
export const GET = async (request) => {
    const url = new URL(request.url);
    const openapiUrl = url.searchParams.get("openapiUrl");
    const isJson = request.headers.get("accept") === "application/json";
    const openapi = await fetchOpenapi(openapiUrl || undefined);
    const openapiId = openapiUrl;
    const operations = openapiId && openapiUrl && openapi
        ? getOperations(openapi, openapiId, openapiUrl)
        : undefined;
    // console.log({ openapiUrl, operations });
    if (!operations) {
        return new Response("No operations");
    }
    if (!openapi) {
        return new Response("No openapi");
    }
    const uniqueOperationTags = operations
        .map((x) => x.operation.tags)
        .filter(notEmpty)
        .flat();
    const tags = (openapi.tags || [])
        .concat(uniqueOperationTags.map((x) => ({ name: x, description: undefined })))
        .filter(onlyUnique2((a, b) => a.name === b.name));
    const operationsWithTags = tags
        .concat({ name: "__undefined", description: "No tags present" })
        .map((tag) => {
        const description = tag.description
            ? `: ${tag.description}`
            : tag.externalDocs
                ? `: ${tag.externalDocs.url}`
                : "";
        const filtered = operations.filter((x) => tag.name === "__undefined"
            ? !x.operation.tags?.length
            : x.operation.tags?.includes(tag.name));
        if (filtered.length === 0) {
            return null;
        }
        const { name } = tag;
        return filtered.map((x) => ({
            ...x,
            tag: name,
            tagDescription: description,
        }));
    })
        .filter(notEmpty)
        .flat();
    if (isJson) {
        return new Response(JSON.stringify(operationsWithTags), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    }
    const llmString = ``;
    // const llmString = operationsPerTag
    //   .map(({ name, description, operations }) => {
    //     return `${name}${description}\n${operations
    //       .map((item) => {
    //         return `- ${item.operationId} - ${item.operation.summary}`;
    //       })
    //       .join("\n")}`;
    //   })
    //   .filter(notEmpty)
    //   .join("\n\n");
    return new Response(llmString);
};
//# sourceMappingURL=summarizeOpenapi.js.map