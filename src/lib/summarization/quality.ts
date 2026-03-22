import type { SummaryContent } from "@/lib/types";

export interface QualityReport {
  score: number;
  checks: {
    name: string;
    passed: boolean;
    score: number;
    detail: string;
  }[];
}

/**
 * Score a summary for quality (0.0 - 1.0).
 * Auto-publish threshold: 0.7
 */
export function scoreSummary(
  content: SummaryContent,
  originalWordCount: number
): QualityReport {
  const checks: QualityReport["checks"] = [];

  // 1. Has executive summary
  const execLength = content.executive_summary?.length || 0;
  checks.push({
    name: "executive_summary_present",
    passed: execLength > 100,
    score: Math.min(execLength / 500, 1),
    detail: `Executive summary: ${execLength} chars`,
  });

  // 2. Has chapter summaries
  const chapterCount = content.chapters?.length || 0;
  checks.push({
    name: "chapters_present",
    passed: chapterCount >= 1,
    score: Math.min(chapterCount / 5, 1),
    detail: `${chapterCount} chapters summarized`,
  });

  // 3. Chapters have key points
  const chaptersWithPoints = content.chapters?.filter(
    (ch) => ch.key_points && ch.key_points.length > 0
  ).length || 0;
  checks.push({
    name: "key_points_coverage",
    passed: chaptersWithPoints >= chapterCount * 0.5,
    score: chapterCount > 0 ? chaptersWithPoints / chapterCount : 0,
    detail: `${chaptersWithPoints}/${chapterCount} chapters have key points`,
  });

  // 4. Has key concepts
  const conceptCount = content.key_concepts?.length || 0;
  checks.push({
    name: "key_concepts",
    passed: conceptCount >= 3,
    score: Math.min(conceptCount / 8, 1),
    detail: `${conceptCount} key concepts`,
  });

  // 5. Has takeaways
  const takeawayCount = content.takeaways?.length || 0;
  checks.push({
    name: "takeaways",
    passed: takeawayCount >= 2,
    score: Math.min(takeawayCount / 5, 1),
    detail: `${takeawayCount} takeaways`,
  });

  // 6. Compression ratio (summary should be ~3-5% of original)
  const summaryWords = estimateWordCount(content);
  const ratio = originalWordCount > 0 ? summaryWords / originalWordCount : 0;
  checks.push({
    name: "compression_ratio",
    passed: ratio > 0.01 && ratio < 0.1,
    score: ratio > 0.01 && ratio < 0.1 ? 1 : ratio > 0.1 ? 0.5 : 0.3,
    detail: `${(ratio * 100).toFixed(1)}% of original (${summaryWords} words from ${originalWordCount})`,
  });

  // 7. No empty chapters
  const emptyChapters = content.chapters?.filter(
    (ch) => !ch.summary || ch.summary.length < 50
  ).length || 0;
  checks.push({
    name: "no_empty_chapters",
    passed: emptyChapters === 0,
    score: chapterCount > 0 ? 1 - emptyChapters / chapterCount : 0,
    detail: `${emptyChapters} empty chapters`,
  });

  // Calculate overall score (weighted average)
  const weights = [0.2, 0.2, 0.15, 0.15, 0.1, 0.1, 0.1];
  const totalScore = checks.reduce(
    (sum, check, i) => sum + check.score * (weights[i] || 0.1),
    0
  );

  return {
    score: Math.round(totalScore * 100) / 100,
    checks,
  };
}

function estimateWordCount(content: SummaryContent): number {
  let words = 0;
  if (content.executive_summary) {
    words += content.executive_summary.split(/\s+/).length;
  }
  for (const chapter of content.chapters || []) {
    words += (chapter.summary?.split(/\s+/).length || 0);
    for (const point of chapter.key_points || []) {
      words += point.split(/\s+/).length;
    }
  }
  for (const concept of content.key_concepts || []) {
    words += concept.split(/\s+/).length;
  }
  for (const takeaway of content.takeaways || []) {
    words += takeaway.split(/\s+/).length;
  }
  return words;
}

/**
 * Whether a summary passes auto-publish threshold.
 */
export function isAutoPublishable(report: QualityReport): boolean {
  return report.score >= 0.7 && report.checks.every((c) => c.score > 0.3);
}
