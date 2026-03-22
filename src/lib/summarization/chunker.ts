export interface Chapter {
  title: string;
  content: string;
  wordCount: number;
  order: number;
}

const CHAPTER_PATTERNS = [
  /^(?:CHAPTER|Chapter|PART|Part)\s+[\dIVXLCDM]+[.:)—\s]/m,
  /^(?:BOOK|Book)\s+[\dIVXLCDM]+/m,
  /^\d+\.\s+[A-Z]/m,
  /^[IVX]+\.\s+[A-Z]/m,
];

/**
 * Split book text into semantic chapters.
 * Falls back to fixed-size chunks if no chapter markers found.
 */
export function chunkByChapters(
  text: string,
  maxChunkWords: number = 4000
): Chapter[] {
  // Try to detect chapter boundaries
  for (const pattern of CHAPTER_PATTERNS) {
    const chapters = splitByPattern(text, pattern);
    if (chapters.length >= 3) {
      return mergeSmallChapters(chapters, maxChunkWords);
    }
  }

  // Fallback: split by paragraph groups into ~maxChunkWords chunks
  return chunkByWordCount(text, maxChunkWords);
}

function splitByPattern(text: string, pattern: RegExp): Chapter[] {
  const globalPattern = new RegExp(pattern.source, "gm");
  const matches: { index: number; title: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = globalPattern.exec(text)) !== null) {
    matches.push({ index: match.index, title: match[0].trim() });
  }

  if (matches.length < 2) return [];

  const chapters: Chapter[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const content = text.substring(start, end).trim();

    chapters.push({
      title: matches[i].title.replace(/[.:)—]+$/, "").trim(),
      content,
      wordCount: content.split(/\s+/).length,
      order: i + 1,
    });
  }

  return chapters;
}

function chunkByWordCount(text: string, maxWords: number): Chapter[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chapters: Chapter[] = [];
  let currentContent = "";
  let currentWords = 0;
  let chapterNum = 1;

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).length;

    if (currentWords + paraWords > maxWords && currentContent.length > 0) {
      chapters.push({
        title: `Section ${chapterNum}`,
        content: currentContent.trim(),
        wordCount: currentWords,
        order: chapterNum,
      });
      chapterNum++;
      currentContent = "";
      currentWords = 0;
    }

    currentContent += para + "\n\n";
    currentWords += paraWords;
  }

  if (currentContent.trim().length > 0) {
    chapters.push({
      title: `Section ${chapterNum}`,
      content: currentContent.trim(),
      wordCount: currentWords,
      order: chapterNum,
    });
  }

  return chapters;
}

/**
 * Merge chapters that are too small into their neighbors.
 */
function mergeSmallChapters(
  chapters: Chapter[],
  maxWords: number
): Chapter[] {
  const minWords = 200;
  const merged: Chapter[] = [];

  for (const chapter of chapters) {
    if (
      merged.length > 0 &&
      merged[merged.length - 1].wordCount < minWords
    ) {
      const last = merged[merged.length - 1];
      last.content += "\n\n" + chapter.content;
      last.wordCount += chapter.wordCount;
    } else {
      merged.push({ ...chapter });
    }
  }

  // Split chapters that are too large
  const result: Chapter[] = [];
  for (const chapter of merged) {
    if (chapter.wordCount > maxWords * 2) {
      const subChunks = chunkByWordCount(chapter.content, maxWords);
      for (let i = 0; i < subChunks.length; i++) {
        result.push({
          ...subChunks[i],
          title: i === 0 ? chapter.title : `${chapter.title} (cont.)`,
          order: result.length + 1,
        });
      }
    } else {
      result.push({ ...chapter, order: result.length + 1 });
    }
  }

  return result;
}
