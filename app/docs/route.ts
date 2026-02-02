import { ApiReference } from "@scalar/nextjs-api-reference";

const spec = {
    openapi: "3.1.0",
    info: {
        title: "Simulark Context API",
        version: "1.0.0",
        description: "API for accessing live Simulark architecture contexts."
    },
    paths: {
        "/api/simulark/context": {
            get: {
                summary: "Get Project Context",
                description: "Retrieve valid JSON architecture for a given project ID.",
                parameters: [
                    {
                        name: "projectId",
                        in: "query",
                        required: true,
                        schema: { type: "string" },
                        description: "The UUID of the project"
                    }
                ],
                responses: {
                    "200": {
                        description: "Architectural JSON",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        project: { type: "string" },
                                        nodes: { type: "array", items: { type: "object" } },
                                        edges: { type: "array", items: { type: "object" } }
                                    }
                                }
                            }
                        }
                    },
                    "404": { description: "Project not found" }
                }
            }
        }
    }
};

export const GET = ApiReference({
    spec: {
        content: spec
    }
});
