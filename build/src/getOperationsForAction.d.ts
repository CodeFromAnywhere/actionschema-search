export declare const getOperationsForAction: (context: {
    providerSlug: string;
    actionDescription: string;
    origin: string;
    GROQ_API_KEY: string;
}) => Promise<{
    operations: {
        operationId: string;
        likelihood: number;
    }[] | undefined;
} | undefined>;
//# sourceMappingURL=getOperationsForAction.d.ts.map