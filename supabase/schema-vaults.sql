-- CodexLib Vault Schema Migration
-- Adds Obsidian vault integration tables

-- 13. Vaults (a user can have multiple)
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  note_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- 14. Vault Notes (individual notes within a vault)
CREATE TABLE vault_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  folder_path TEXT DEFAULT '/',
  content_raw TEXT NOT NULL,
  content_compressed TEXT,
  rosetta TEXT,
  token_count INTEGER,
  tags TEXT[] DEFAULT '{}',
  backlinks TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vault_id, slug)
);

-- Indexes
CREATE INDEX idx_vaults_user ON vaults(user_id);
CREATE INDEX idx_vaults_slug ON vaults(slug);
CREATE INDEX idx_vault_notes_vault ON vault_notes(vault_id);
CREATE INDEX idx_vault_notes_user ON vault_notes(user_id);
CREATE INDEX idx_vault_notes_folder ON vault_notes(vault_id, folder_path);
CREATE INDEX idx_vault_notes_title_trgm ON vault_notes USING gin(title gin_trgm_ops);
CREATE INDEX idx_vault_notes_tags ON vault_notes USING gin(tags);

-- Trigger: update vault note_count
CREATE OR REPLACE FUNCTION update_vault_note_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vaults SET note_count = note_count + 1 WHERE id = NEW.vault_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE vaults SET note_count = note_count - 1 WHERE id = OLD.vault_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vault_note_change
  AFTER INSERT OR DELETE ON vault_notes
  FOR EACH ROW EXECUTE FUNCTION update_vault_note_count();

-- RLS
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_notes ENABLE ROW LEVEL SECURITY;

-- Vault policies
CREATE POLICY "Public read public vaults" ON vaults
  FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users read own vaults" ON vaults
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own vaults" ON vaults
  FOR ALL USING (auth.uid() = user_id);

-- Vault note policies
CREATE POLICY "Public read public notes" ON vault_notes
  FOR SELECT USING (
    is_public = TRUE AND EXISTS (
      SELECT 1 FROM vaults WHERE id = vault_notes.vault_id AND is_public = TRUE
    )
  );
CREATE POLICY "Users read own notes" ON vault_notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notes" ON vault_notes
  FOR ALL USING (auth.uid() = user_id);
