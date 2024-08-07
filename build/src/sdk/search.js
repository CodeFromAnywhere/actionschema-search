import { createClient } from "./api-helpers.js";
export const searchOpenapi = {
    "openapi": "3.1.0",
    "$schema": "https://spec.actionschema.com/openapi.json",
    "x-actionschema": "0.0.1",
    "info": {
        "title": "API Specification",
        "version": "1.0.0",
        "description": "API specification for search endpoints"
    },
    "security": [
        {
            "oauth2": []
        }
    ],
    "servers": [
        {
            "url": "https://search.actionschema.com/api"
        }
    ],
    "paths": {
        "/summarizeOpenapi": {
            "get": {
                "summary": "Summarize OpenAPI Specification",
                "description": "Get all operationId/summary pairs for any OpenAPI specification in text or JSON format.",
                "operationId": "summarizeOpenapi",
                "parameters": [
                    {
                        "name": "openapiUrl",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "URL of the OpenAPI specification to summarize"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": {
                                                "type": "string"
                                            },
                                            "description": {
                                                "type": "string"
                                            },
                                            "operations": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "id": {
                                                            "type": "string"
                                                        },
                                                        "operation": {
                                                            "type": "object",
                                                            "properties": {
                                                                "summary": {
                                                                    "type": "string"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "text/plain": {
                                "schema": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "components": {
        "securitySchemes": {
            "oauth2": {
                "type": "oauth2",
                "flows": {
                    "authorizationCode": {
                        "authorizationUrl": "https://auth.actionschema.com/oauth/github/login",
                        "tokenUrl": "https://auth.actionschema.com/oauth/access_token",
                        "scopes": {
                            "admin": "Full access to all services"
                        }
                    }
                }
            }
        },
        "schemas": {}
    }
};
export const search = createClient(searchOpenapi, "https://search.actionschema.com/openapi.json", { access_token: process.env.undefined });
//# sourceMappingURL=search.js.map