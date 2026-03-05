"use client";

import { useMemo } from "react";

function parseMarkdown(raw: string): string {
  let html = raw
    // Code blocks (fenced)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-gold">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gold">$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-gold hover:text-gold-light underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Wikilinks (Obsidian style) — render as plain text with gold color
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '<span class="text-gold">$2</span>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="text-gold">$1</span>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-gold/30 pl-4 text-muted italic my-2">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border my-6" />')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Paragraphs (blank lines)
    .replace(/\n\n/g, '</p><p class="my-3">');

  return `<p class="my-3">${html}</p>`;
}

export function MarkdownViewer({ content }: { content: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className="prose-custom leading-relaxed text-foreground/90"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
