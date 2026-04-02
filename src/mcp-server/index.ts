import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  downloadPacks,
  getPack,
  listPacks,
  searchPacks,
  SporeAuthError,
  SporeConfigError,
  SporeNotFoundError,
  SporePermissionError,
  SporeRateLimitError,
} from "./packs";

const difficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

const listPacksInputSchema = z.object({
  domain: z.string().trim().min(1).optional(),
  difficulty: difficultySchema.optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  apiKey: z.string().trim().min(1).optional(),
});

const searchPacksInputSchema = listPacksInputSchema.extend({
  query: z.string().trim().min(1),
});

const getPackInputSchema = z.object({
  id: z.string().trim().min(1),
  apiKey: z.string().trim().min(1).optional(),
});

const downloadPacksInputSchema = z.object({
  domain: z.string().trim().min(1).optional(),
  apiKey: z.string().trim().min(1).optional(),
});

function formatToolResult(result: unknown, summary: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: `${summary}\n\n${JSON.stringify(result, null, 2)}`,
      },
    ],
    structuredContent:
      typeof result === "object" && result !== null
        ? (result as Record<string, unknown>)
        : { result },
  };
}

function formatToolError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown server error.";

  const errorType =
    error instanceof SporeConfigError
      ? "configuration_error"
      : error instanceof SporeAuthError
        ? "authentication_error"
        : error instanceof SporePermissionError
          ? "permission_error"
          : error instanceof SporeNotFoundError
            ? "not_found"
            : error instanceof SporeRateLimitError
              ? "rate_limit_error"
              : "internal_error";

  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: `${errorType}: ${message}`,
      },
    ],
    structuredContent: {
      error: errorType,
      message,
    },
  };
}

export function createSporeMcpServer() {
  const server = new McpServer({
    name: "spore-mcp-server",
    version: "0.1.0",
  });

  server.registerTool(
    "spore_list_packs",
    {
      title: "List Spore Packs",
      description:
        "List approved packs with optional domain and difficulty filters.",
      inputSchema: listPacksInputSchema,
    },
    async (input) => {
      try {
        const result = await listPacks(input);
        return formatToolResult(result, result.summary);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "spore_search_packs",
    {
      title: "Search Spore Packs",
      description:
        "Search approved packs by title, with optional domain and difficulty filters.",
      inputSchema: searchPacksInputSchema,
    },
    async (input) => {
      try {
        const result = await searchPacks(input);
        return formatToolResult(result, result.summary);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "spore_get_pack",
    {
      title: "Get Spore Pack",
      description:
        "Fetch one approved pack by slug or UUID, returning preview content unless a paid API key is available.",
      inputSchema: getPackInputSchema,
    },
    async (input) => {
      try {
        const result = await getPack(input);
        return formatToolResult(result, result.summary);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  server.registerTool(
    "spore_download_pack",
    {
      title: "Bulk Download Spore Packs",
      description:
        "Return up to 100 approved packs for bulk download. Requires a Pro or Team API key.",
      inputSchema: downloadPacksInputSchema,
    },
    async (input) => {
      try {
        const result = await downloadPacks(input);
        return formatToolResult(result, result.summary);
      } catch (error) {
        return formatToolError(error);
      }
    }
  );

  return server;
}

async function main() {
  const server = createSporeMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

if (process.env.NODE_ENV !== "test") {
  void main().catch((error) => {
    const message =
      error instanceof Error ? error.message : "Unknown MCP server error.";
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
}
