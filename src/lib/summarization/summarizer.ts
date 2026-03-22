import type { Chapter } from "./chunker";
import type { SummaryContent } from "@/lib/types";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:14b";

interface OllamaResponse {
  response: string;
  done: boolean;
}

/**
 * Call local Ollama for draft summarization (free, no API cost).
 */
async function ollamaSummarize(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 2048,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as OllamaResponse;
  return data.response.trim();
}

/**
 * Call Claude API for final polish and quality scoring.
 * Uses Anthropic SDK if available, falls back to direct API call.
 */
async function claudePolish(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fall back to Ollama if no Claude API key
    return ollamaSummarize(prompt);
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    // Fall back to Ollama on API error
    return ollamaSummarize(prompt);
  }

  const data = await response.json();
  const textBlock = data.content?.find(
    (b: { type: string }) => b.type === "text"
  );
  return textBlock?.text?.trim() || "";
}

/**
 * Summarize a single chapter using Ollama (draft).
 */
export async function summarizeChapter(
  chapter: Chapter,
  bookTitle: string
): Promise<{ title: string; summary: string; keyPoints: string[] }> {
  const prompt = `You are summarizing a chapter from the book "${bookTitle}".

Chapter: "${chapter.title}"

Text:
${chapter.content.substring(0, 12000)}

Provide:
1. A concise summary (2-3 paragraphs)
2. 3-5 key points as bullet points

Format your response as:
SUMMARY:
[your summary]

KEY POINTS:
- [point 1]
- [point 2]
- [point 3]`;

  const response = await ollamaSummarize(prompt);

  // Parse response
  const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/i);
  const keyPointsMatch = response.match(/KEY POINTS:\s*([\s\S]*?)$/i);

  const summary = summaryMatch?.[1]?.trim() || response;
  const keyPoints = keyPointsMatch?.[1]
    ?.split(/\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line.length > 0) || [];

  return {
    title: chapter.title,
    summary,
    keyPoints,
  };
}

/**
 * Generate the final executive summary using Claude (polished).
 */
export async function generateExecutiveSummary(
  bookTitle: string,
  bookAuthor: string,
  chapterSummaries: { title: string; summary: string; keyPoints: string[] }[]
): Promise<SummaryContent> {
  const chaptersText = chapterSummaries
    .map(
      (ch, i) =>
        `Chapter ${i + 1}: ${ch.title}\n${ch.summary}\nKey Points: ${ch.keyPoints.join("; ")}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are creating a polished executive summary for an AI knowledge system.

Book: "${bookTitle}" by ${bookAuthor}
Chapter summaries:

${chaptersText}

Create a structured summary with:
1. An executive summary (1-2 paragraphs capturing the book's core thesis and value)
2. The chapter summaries refined for clarity
3. A list of 5-10 key concepts from the entire book
4. 3-5 actionable takeaways

Format as JSON:
{
  "executive_summary": "...",
  "key_concepts": ["concept1", "concept2", ...],
  "takeaways": ["takeaway1", "takeaway2", ...]
}`;

  const response = await claudePolish(prompt);

  // Parse JSON from response
  let parsed: { executive_summary?: string; key_concepts?: string[]; takeaways?: string[] } = {};
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // If JSON parsing fails, use raw response
  }

  return {
    title: bookTitle,
    executive_summary: parsed.executive_summary || response.substring(0, 1000),
    chapters: chapterSummaries.map((ch) => ({
      title: ch.title,
      summary: ch.summary,
      key_points: ch.keyPoints,
    })),
    key_concepts: parsed.key_concepts || [],
    takeaways: parsed.takeaways || [],
  };
}

/**
 * Full hybrid summarization pipeline.
 * 1. Ollama summarizes each chapter (free, local)
 * 2. Claude generates polished executive summary
 */
export async function summarizeBook(
  bookTitle: string,
  bookAuthor: string,
  chapters: Chapter[]
): Promise<{ content: SummaryContent; modelUsed: string }> {
  // Step 1: Summarize each chapter with Ollama (parallel, batched)
  const batchSize = 3;
  const chapterSummaries: { title: string; summary: string; keyPoints: string[] }[] = [];

  for (let i = 0; i < chapters.length; i += batchSize) {
    const batch = chapters.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((chapter) => summarizeChapter(chapter, bookTitle))
    );
    chapterSummaries.push(...results);
  }

  // Step 2: Generate executive summary with Claude
  const content = await generateExecutiveSummary(
    bookTitle,
    bookAuthor,
    chapterSummaries
  );

  const modelUsed = process.env.ANTHROPIC_API_KEY
    ? `ollama/${OLLAMA_MODEL} + claude-sonnet-4-5-20250514`
    : `ollama/${OLLAMA_MODEL}`;

  return { content, modelUsed };
}
