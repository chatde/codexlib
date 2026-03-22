/**
 * Utilities for fetching and managing public domain books
 * from Project Gutenberg and Open Library.
 */

export interface GutenbergBook {
  id: number;
  title: string;
  author: string;
  subjects: string[];
  language: string;
}

/**
 * Search Project Gutenberg for books by subject or keyword.
 * Uses the Gutendex API (free, no auth).
 */
export async function searchGutenberg(
  query: string,
  page: number = 1
): Promise<{ count: number; books: GutenbergBook[] }> {
  const url = new URL("https://gutendex.com/books/");
  url.searchParams.set("search", query);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("languages", "en");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Gutendex API error: ${response.status}`);
  }

  const data = await response.json();

  const books: GutenbergBook[] = (data.results || []).map(
    (book: {
      id: number;
      title: string;
      authors: { name: string }[];
      subjects: string[];
      languages: string[];
    }) => ({
      id: book.id,
      title: book.title,
      author: book.authors?.[0]?.name || "Unknown",
      subjects: book.subjects || [],
      language: book.languages?.[0] || "en",
    })
  );

  return { count: data.count || 0, books };
}

/**
 * Get the text download URL for a Gutenberg book.
 */
export function getGutenbergTextUrl(bookId: number): string {
  return `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
}

/**
 * Curated list of popular public domain books good for seeding.
 * These are well-known works with clear chapter structures.
 */
export const SEED_BOOKS: { id: number; title: string; author: string; category: string }[] = [
  { id: 1342, title: "Pride and Prejudice", author: "Jane Austen", category: "Fiction" },
  { id: 84, title: "Frankenstein", author: "Mary Shelley", category: "Fiction" },
  { id: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", category: "Mystery" },
  { id: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", category: "Fiction" },
  { id: 1232, title: "The Prince", author: "Niccolo Machiavelli", category: "Philosophy" },
  { id: 4300, title: "Ulysses", author: "James Joyce", category: "Fiction" },
  { id: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", category: "Fiction" },
  { id: 1260, title: "Jane Eyre", author: "Charlotte Bronte", category: "Fiction" },
  { id: 98, title: "A Tale of Two Cities", author: "Charles Dickens", category: "Fiction" },
  { id: 1080, title: "A Modest Proposal", author: "Jonathan Swift", category: "Satire" },
  { id: 76, title: "Adventures of Huckleberry Finn", author: "Mark Twain", category: "Fiction" },
  { id: 1952, title: "The Yellow Wallpaper", author: "Charlotte Perkins Gilman", category: "Fiction" },
  { id: 2701, title: "Moby Dick", author: "Herman Melville", category: "Fiction" },
  { id: 345, title: "Dracula", author: "Bram Stoker", category: "Horror" },
  { id: 1400, title: "Great Expectations", author: "Charles Dickens", category: "Fiction" },
  { id: 16328, title: "Beowulf", author: "Anonymous", category: "Poetry" },
  { id: 5200, title: "Metamorphosis", author: "Franz Kafka", category: "Fiction" },
  { id: 1497, title: "Republic", author: "Plato", category: "Philosophy" },
  { id: 2600, title: "War and Peace", author: "Leo Tolstoy", category: "Fiction" },
  { id: 36, title: "The War of the Worlds", author: "H.G. Wells", category: "Science Fiction" },
];

/**
 * Map Gutenberg subjects to CodexLib domain slugs.
 */
export function mapSubjectToDomain(subjects: string[]): string {
  const subjectStr = subjects.join(" ").toLowerCase();

  if (subjectStr.includes("philosophy") || subjectStr.includes("ethics")) return "philosophy";
  if (subjectStr.includes("science fiction") || subjectStr.includes("sci-fi")) return "science-fiction";
  if (subjectStr.includes("history")) return "history";
  if (subjectStr.includes("psychology")) return "psychology";
  if (subjectStr.includes("economics") || subjectStr.includes("finance")) return "finance";
  if (subjectStr.includes("medicine") || subjectStr.includes("health")) return "medicine";
  if (subjectStr.includes("law")) return "law";
  if (subjectStr.includes("poetry")) return "literature";
  if (subjectStr.includes("fiction") || subjectStr.includes("novel")) return "literature";
  if (subjectStr.includes("education")) return "education";
  if (subjectStr.includes("art")) return "art";
  if (subjectStr.includes("music")) return "music";

  return "general";
}
