"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSporeMcpServer = createSporeMcpServer;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const packs_1 = require("./packs");
const difficultySchema = zod_1.z.enum([
    "beginner",
    "intermediate",
    "advanced",
    "expert",
]);
const listPacksInputSchema = zod_1.z.object({
    domain: zod_1.z.string().trim().min(1).optional(),
    difficulty: difficultySchema.optional(),
    page: zod_1.z.number().int().min(1).optional(),
    limit: zod_1.z.number().int().min(1).max(100).optional(),
    apiKey: zod_1.z.string().trim().min(1).optional(),
});
const searchPacksInputSchema = listPacksInputSchema.extend({
    query: zod_1.z.string().trim().min(1),
});
const getPackInputSchema = zod_1.z.object({
    id: zod_1.z.string().trim().min(1),
    apiKey: zod_1.z.string().trim().min(1).optional(),
});
const downloadPacksInputSchema = zod_1.z.object({
    domain: zod_1.z.string().trim().min(1).optional(),
    apiKey: zod_1.z.string().trim().min(1).optional(),
});
function formatToolResult(result, summary) {
    return {
        content: [
            {
                type: "text",
                text: `${summary}\n\n${JSON.stringify(result, null, 2)}`,
            },
        ],
        structuredContent: typeof result === "object" && result !== null
            ? result
            : { result },
    };
}
function formatToolError(error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    const errorType = error instanceof packs_1.SporeConfigError
        ? "configuration_error"
        : error instanceof packs_1.SporeAuthError
            ? "authentication_error"
            : error instanceof packs_1.SporePermissionError
                ? "permission_error"
                : error instanceof packs_1.SporeNotFoundError
                    ? "not_found"
                    : error instanceof packs_1.SporeRateLimitError
                        ? "rate_limit_error"
                        : "internal_error";
    return {
        isError: true,
        content: [
            {
                type: "text",
                text: `${errorType}: ${message}`,
            },
        ],
        structuredContent: {
            error: errorType,
            message,
        },
    };
}
function createSporeMcpServer() {
    const server = new mcp_js_1.McpServer({
        name: "spore-mcp-server",
        version: "0.1.0",
    });
    server.registerTool("spore_list_packs", {
        title: "List Spore Packs",
        description: "List approved packs with optional domain and difficulty filters.",
        inputSchema: listPacksInputSchema,
    }, async (input) => {
        try {
            const result = await (0, packs_1.listPacks)(input);
            return formatToolResult(result, result.summary);
        }
        catch (error) {
            return formatToolError(error);
        }
    });
    server.registerTool("spore_search_packs", {
        title: "Search Spore Packs",
        description: "Search approved packs by title, with optional domain and difficulty filters.",
        inputSchema: searchPacksInputSchema,
    }, async (input) => {
        try {
            const result = await (0, packs_1.searchPacks)(input);
            return formatToolResult(result, result.summary);
        }
        catch (error) {
            return formatToolError(error);
        }
    });
    server.registerTool("spore_get_pack", {
        title: "Get Spore Pack",
        description: "Fetch one approved pack by slug or UUID, returning preview content unless a paid API key is available.",
        inputSchema: getPackInputSchema,
    }, async (input) => {
        try {
            const result = await (0, packs_1.getPack)(input);
            return formatToolResult(result, result.summary);
        }
        catch (error) {
            return formatToolError(error);
        }
    });
    server.registerTool("spore_download_pack", {
        title: "Bulk Download Spore Packs",
        description: "Return up to 100 approved packs for bulk download. Requires a Pro or Team API key.",
        inputSchema: downloadPacksInputSchema,
    }, async (input) => {
        try {
            const result = await (0, packs_1.downloadPacks)(input);
            return formatToolResult(result, result.summary);
        }
        catch (error) {
            return formatToolError(error);
        }
    });
    return server;
}
async function main() {
    const server = createSporeMcpServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
if (process.env.NODE_ENV !== "test") {
    void main().catch((error) => {
        const message = error instanceof Error ? error.message : "Unknown MCP server error.";
        process.stderr.write(`${message}\n`);
        process.exit(1);
    });
}
