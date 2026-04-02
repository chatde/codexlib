import * as esbuild from "esbuild";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outdir = join(root, "dist", "mcp-server");

if (!existsSync(outdir)) mkdirSync(outdir, { recursive: true });

await esbuild.build({
  entryPoints: [join(root, "src", "mcp-server", "index.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: join(outdir, "index.js"),
  format: "esm",
  external: [],
  sourcemap: false,
  minify: false,
});

console.log("MCP server built:", outdir);
