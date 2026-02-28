import { BookOpen } from "lucide-react";

export const metadata = {
  title: "API Documentation — CodexLib",
  description: "REST API for accessing AI-optimized knowledge packs",
};

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-gold" />
          API Documentation
        </h1>
        <p className="mt-2 text-muted">
          Access knowledge packs programmatically via REST API
        </p>
      </div>

      <div className="space-y-8">
        {/* Auth */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold mb-3">Authentication</h2>
          <p className="text-sm text-muted mb-3">
            Generate an API key in{" "}
            <a href="/settings" className="text-gold">
              Settings
            </a>
            . Pass it in the <code className="text-gold">x-api-key</code>{" "}
            header.
          </p>
          <pre className="rounded-lg bg-background p-4 text-sm font-mono overflow-x-auto">
            {`curl -H "x-api-key: cxl_your_key_here" \\
  https://codexlib.io/api/v1/packs`}
          </pre>
          <div className="mt-3 text-xs text-muted">
            <p>Rate limits: Free = 10 requests/day, Pro = 1,000 requests/day</p>
          </div>
        </section>

        {/* List Packs */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold mb-1">
            <span className="text-green-400">GET</span> /api/v1/packs
          </h2>
          <p className="text-sm text-muted mb-3">
            List and search knowledge packs
          </p>
          <h3 className="text-sm font-semibold mb-2">Query Parameters</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-2 pr-4">Param</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-gold">domain</td>
                  <td className="py-2 pr-4 text-muted">string</td>
                  <td className="py-2 font-sans">Filter by domain slug</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-gold">search</td>
                  <td className="py-2 pr-4 text-muted">string</td>
                  <td className="py-2 font-sans">Search by title</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-gold">difficulty</td>
                  <td className="py-2 pr-4 text-muted">string</td>
                  <td className="py-2 font-sans">
                    beginner | intermediate | advanced | expert
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 text-gold">page</td>
                  <td className="py-2 pr-4 text-muted">number</td>
                  <td className="py-2 font-sans">Page number (default: 1)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-gold">limit</td>
                  <td className="py-2 pr-4 text-muted">number</td>
                  <td className="py-2 font-sans">
                    Results per page (default: 20, max: 100)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre className="mt-4 rounded-lg bg-background p-4 text-xs font-mono overflow-x-auto">
            {`curl "https://codexlib.io/api/v1/packs?domain=medicine&difficulty=intermediate&limit=10" \\
  -H "x-api-key: cxl_your_key"`}
          </pre>
        </section>

        {/* Get Pack */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold mb-1">
            <span className="text-green-400">GET</span> /api/v1/packs/:id
          </h2>
          <p className="text-sm text-muted mb-3">
            Get a single knowledge pack by ID or slug
          </p>
          <pre className="rounded-lg bg-background p-4 text-xs font-mono overflow-x-auto">
            {`curl "https://codexlib.io/api/v1/packs/med-cardiology-001" \\
  -H "x-api-key: cxl_your_key"`}
          </pre>
          <div className="mt-3 text-xs text-muted">
            <p>
              Free users see 20% preview. Pro users get full content + rosetta
              decoder.
            </p>
          </div>
        </section>

        {/* Bulk Download */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold mb-1">
            <span className="text-green-400">GET</span> /api/v1/packs/download
          </h2>
          <p className="text-sm text-muted mb-3">
            Bulk download packs (Pro only)
          </p>
          <pre className="rounded-lg bg-background p-4 text-xs font-mono overflow-x-auto">
            {`curl "https://codexlib.io/api/v1/packs/download?domain=ai-ml" \\
  -H "x-api-key: cxl_your_key"`}
          </pre>
          <div className="mt-3 text-xs text-muted">
            <p>Returns up to 100 full packs per request. Pro subscription required.</p>
          </div>
        </section>

        {/* Response Format */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold mb-3">Knowledge Pack Format</h2>
          <pre className="rounded-lg bg-background p-4 text-xs font-mono overflow-x-auto">
            {JSON.stringify(
              {
                id: "med-cardiology-001",
                title: "Cardiology Fundamentals",
                domain: "Medicine",
                subdomain: "Cardiology",
                version: "1.0.0",
                compression: "tokenshrink-v2",
                token_count: 2847,
                uncompressed_estimate: 3400,
                savings_pct: 16.3,
                rosetta:
                  "[DECODE] heart=cardiac organ|bp=blood pressure|...",
                content: "## Cardiac Anatomy\nheart: 4-chamber muscular organ...",
                difficulty: "intermediate",
              },
              null,
              2
            )}
          </pre>
          <div className="mt-3 text-xs text-muted">
            <p>
              The <code className="text-gold">rosetta</code> field contains the
              decoder header. Paste it into any AI system prompt to decompress
              the content on-the-fly.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
