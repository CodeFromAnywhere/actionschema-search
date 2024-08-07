export declare const client: {
    search: <K extends "summarizeOpenapi">(operationId: K, context: Exclude<import("./search.js").Search[K], undefined> extends {
        input: any;
    } ? ({
        input: any;
    } & Exclude<import("./search.js").Search[K], undefined>)["input"] : undefined, customConfig?: {
        access_token?: string | undefined;
        timeoutSeconds?: number | undefined;
    } | undefined) => Promise<Exclude<import("./search.js").Search[K], undefined> extends {
        output: any;
    } ? ({
        output: any;
    } & Exclude<import("./search.js").Search[K], undefined>)["output"] : undefined>;
};
//# sourceMappingURL=client.d.ts.map