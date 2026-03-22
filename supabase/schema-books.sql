-- CodexLib V2: Book Summarization Tables
-- Run after schema.sql

-- Books (source material for summarization)
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  page_count INT,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'epub', 'text', 'url', 'public_domain')),
  source_url TEXT,
  raw_text TEXT,
  word_count INT,
  language TEXT DEFAULT 'en',
  cover_image_url TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'summarized', 'failed', 'rejected')),
  copyright_status TEXT NOT NULL CHECK (copyright_status IN ('public_domain', 'licensed', 'fair_use', 'user_uploaded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Summaries (AI-generated digests)
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  summary_type TEXT NOT NULL CHECK (summary_type IN ('executive', 'chapter_by_chapter', 'key_concepts', 'ai_digest')),
  content JSONB NOT NULL,
  token_count INT,
  compression_ratio FLOAT,
  model_used TEXT,
  quality_score FLOAT,
  human_reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Summary download tracking
CREATE TABLE IF NOT EXISTS summary_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_source_type ON books(source_type);
CREATE INDEX IF NOT EXISTS idx_books_copyright ON books(copyright_status);
CREATE INDEX IF NOT EXISTS idx_books_uploaded_by ON books(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_summaries_book_id ON summaries(book_id);
CREATE INDEX IF NOT EXISTS idx_summaries_type ON summaries(summary_type);
CREATE INDEX IF NOT EXISTS idx_summary_downloads_user ON summary_downloads(user_id);

-- RLS policies
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE summary_downloads ENABLE ROW LEVEL SECURITY;

-- Books: anyone can read summarized books, uploaders can see their own pending
CREATE POLICY "books_public_read" ON books
  FOR SELECT USING (status = 'summarized');

CREATE POLICY "books_owner_read" ON books
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "books_auth_insert" ON books
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Summaries: anyone can read summaries of summarized books
CREATE POLICY "summaries_public_read" ON summaries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = summaries.book_id AND books.status = 'summarized')
  );

-- Summary downloads: users see their own
CREATE POLICY "summary_dl_own" ON summary_downloads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "summary_dl_insert" ON summary_downloads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Updated_at trigger for books
CREATE OR REPLACE FUNCTION update_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_books_updated_at();
