import type { BookSourceType } from "@/lib/types";

export interface IngestResult {
  text: string;
  title: string;
  author: string;
  wordCount: number;
  pageCount: number | null;
  sourceType: BookSourceType;
}

/**
 * Extract text content from a PDF buffer using pdf-parse.
 */
export async function ingestPdf(buffer: Buffer): Promise<IngestResult> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string; numpages: number; info: { Title?: string; Author?: string } }> }).default || pdfParseModule;
  const data = await (pdfParse as (buf: Buffer) => Promise<{ text: string; numpages: number; info: { Title?: string; Author?: string } }>)(buffer);

  const text = data.text.trim();
  const title = data.info?.Title || "Untitled";
  const author = data.info?.Author || "Unknown";

  return {
    text,
    title,
    author,
    wordCount: text.split(/\s+/).length,
    pageCount: data.numpages,
    sourceType: "pdf",
  };
}

/**
 * Extract text from plain text input.
 */
export function ingestText(
  rawText: string,
  title: string,
  author: string
): IngestResult {
  const text = rawText.trim();
  return {
    text,
    title,
    author,
    wordCount: text.split(/\s+/).length,
    pageCount: null,
    sourceType: "text",
  };
}

/**
 * Fetch a public domain book from Project Gutenberg by ID.
 */
export async function ingestGutenberg(gutenbergId: number): Promise<IngestResult> {
  const textUrl = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`;
  const metaUrl = `https://www.gutenberg.org/ebooks/${gutenbergId}`;

  const response = await fetch(textUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Gutenberg book ${gutenbergId}: ${response.status}`);
  }

  const text = await response.text();

  // Strip Gutenberg header/footer boilerplate
  const startMarker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const endMarker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);

  const cleanText =
    startIdx !== -1 && endIdx !== -1
      ? text.substring(text.indexOf("\n", startIdx) + 1, endIdx).trim()
      : text.trim();

  // Try to extract title from the header
  const titleMatch = text.match(/Title:\s*(.+)/);
  const authorMatch = text.match(/Author:\s*(.+)/);

  return {
    text: cleanText,
    title: titleMatch?.[1]?.trim() || `Gutenberg #${gutenbergId}`,
    author: authorMatch?.[1]?.trim() || "Unknown",
    wordCount: cleanText.split(/\s+/).length,
    pageCount: null,
    sourceType: "public_domain",
  };
}

/**
 * Fetch book metadata from Open Library by ISBN.
 */
export async function fetchOpenLibraryMeta(isbn: string): Promise<{
  title: string;
  author: string;
  coverUrl: string | null;
  pageCount: number | null;
}> {
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`
  );
  const data = await response.json();
  const book = data[`ISBN:${isbn}`];

  if (!book) {
    throw new Error(`Book not found for ISBN: ${isbn}`);
  }

  return {
    title: book.title || "Untitled",
    author: book.authors?.[0]?.name || "Unknown",
    coverUrl: book.cover?.large || book.cover?.medium || null,
    pageCount: book.number_of_pages || null,
  };
}
