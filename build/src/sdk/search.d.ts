import { OpenapiDocument } from "./api-helpers.js";
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */
export interface Search {
    /**
     * Get all operationId/summary pairs for any OpenAPI specification in text or JSON format.
     */
    summarizeOpenapi: {
        description?: "Get all operationId/summary pairs for any OpenAPI specification in text or JSON format.";
        externalDocs?: undefined;
        openapiUrl: "https://search.actionschema.com/openapi.json";
        operationId: "summarizeOpenapi";
        summary?: "Summarize OpenAPI Specification";
        tags?: undefined;
        /**
         * 200: Successful response
         *
         * application/json: No description
         *
         * text/plain: No description
         */
        output: {
            "application/json"?: {
                name?: string;
                description?: string;
                operations?: {
                    id?: string;
                    operation?: {
                        summary?: string;
                        [k: string]: unknown;
                    };
                    [k: string]: unknown;
                }[];
                [k: string]: unknown;
            }[];
            "text/plain"?: string;
            status: 200;
            statusDescription?: string;
            statusText?: string;
        };
        input: {
            openapiUrl: string;
        };
    };
}
export declare const searchOpenapi: OpenapiDocument;
export declare const search: <K extends "summarizeOpenapi">(operationId: K, context: Exclude<Search[K], undefined> extends {
    input: any;
} ? ({
    input: any;
} & Exclude<Search[K], undefined>)["input"] : undefined, customConfig?: {
    access_token?: string | undefined;
    timeoutSeconds?: number | undefined;
} | undefined) => Promise<Exclude<Search[K], undefined> extends {
    output: any;
} ? ({
    output: any;
} & Exclude<Search[K], undefined>)["output"] : undefined>;
//# sourceMappingURL=search.d.ts.map