-- CodexLib Database Schema
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  api_key TEXT UNIQUE,
  api_requests_today INTEGER DEFAULT 0,
  api_requests_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Domains
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  pack_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subdomains
CREATE TABLE subdomains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  pack_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain_id, slug)
);

-- 4. Packs
CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  domain_id UUID NOT NULL REFERENCES domains(id),
  subdomain_id UUID REFERENCES subdomains(id),
  version TEXT DEFAULT '1.0.0',
  compression TEXT DEFAULT 'tokenshrink-v2',
  token_count INTEGER NOT NULL DEFAULT 0,
  uncompressed_estimate INTEGER NOT NULL DEFAULT 0,
  savings_pct REAL DEFAULT 0,
  rosetta TEXT NOT NULL DEFAULT '',
  content_compressed TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_free BOOLEAN DEFAULT FALSE,
  downloads INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- 6. Pack Tags (many-to-many)
CREATE TABLE pack_tags (
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, tag_id)
);

-- 7. Pack Prerequisites
CREATE TABLE pack_prerequisites (
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, prerequisite_id),
  CHECK (pack_id != prerequisite_id)
);

-- 8. User Library
CREATE TABLE user_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pack_id)
);

-- 9. User Downloads
CREATE TABLE user_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pack_id)
);

-- 12. Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  domain_id UUID NOT NULL REFERENCES domains(id),
  subdomain_id UUID REFERENCES subdomains(id),
  content_raw TEXT NOT NULL,
  content_compressed TEXT,
  rosetta TEXT,
  token_count INTEGER,
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  flagged_reasons TEXT[],
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_packs_domain ON packs(domain_id);
CREATE INDEX idx_packs_subdomain ON packs(subdomain_id);
CREATE INDEX idx_packs_status ON packs(status);
CREATE INDEX idx_packs_slug ON packs(slug);
CREATE INDEX idx_packs_title_trgm ON packs USING gin(title gin_trgm_ops);
CREATE INDEX idx_packs_content_trgm ON packs USING gin(content_compressed gin_trgm_ops);
CREATE INDEX idx_subdomains_domain ON subdomains(domain_id);
CREATE INDEX idx_user_library_user ON user_library(user_id);
CREATE INDEX idx_user_downloads_user ON user_downloads(user_id);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- Triggers
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE packs SET downloads = downloads + 1 WHERE id = NEW.pack_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_download_insert
  AFTER INSERT ON user_downloads
  FOR EACH ROW EXECUTE FUNCTION increment_download_count();

CREATE OR REPLACE FUNCTION update_pack_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE packs SET
    rating = (SELECT AVG(rating)::REAL FROM reviews WHERE pack_id = NEW.pack_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE pack_id = NEW.pack_id)
  WHERE id = NEW.pack_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_pack_rating();

CREATE OR REPLACE FUNCTION update_domain_pack_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE domains SET pack_count = pack_count + 1 WHERE id = NEW.domain_id;
    IF NEW.subdomain_id IS NOT NULL THEN
      UPDATE subdomains SET pack_count = pack_count + 1 WHERE id = NEW.subdomain_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE domains SET pack_count = pack_count + 1 WHERE id = NEW.domain_id;
      IF NEW.subdomain_id IS NOT NULL THEN
        UPDATE subdomains SET pack_count = pack_count + 1 WHERE id = NEW.subdomain_id;
      END IF;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE domains SET pack_count = pack_count - 1 WHERE id = OLD.domain_id;
      IF OLD.subdomain_id IS NOT NULL THEN
        UPDATE subdomains SET pack_count = pack_count - 1 WHERE id = OLD.subdomain_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE domains SET pack_count = pack_count - 1 WHERE id = OLD.domain_id;
    IF OLD.subdomain_id IS NOT NULL THEN
      UPDATE subdomains SET pack_count = pack_count - 1 WHERE id = OLD.subdomain_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pack_status_change
  AFTER INSERT OR UPDATE OR DELETE ON packs
  FOR EACH ROW EXECUTE FUNCTION update_domain_pack_count();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Public read for catalog data
CREATE POLICY "Public read domains" ON domains FOR SELECT USING (true);
CREATE POLICY "Public read subdomains" ON subdomains FOR SELECT USING (true);
CREATE POLICY "Public read approved packs" ON packs FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read pack_tags" ON pack_tags FOR SELECT USING (true);
CREATE POLICY "Public read pack_prerequisites" ON pack_prerequisites FOR SELECT USING (true);

-- Profile policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

-- Admin can read all packs (including drafts)
CREATE POLICY "Admins read all packs" ON packs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins manage packs" ON packs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- User library
CREATE POLICY "Users manage own library" ON user_library FOR ALL USING (auth.uid() = user_id);

-- User downloads
CREATE POLICY "Users read own downloads" ON user_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own downloads" ON user_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);

-- Submissions
CREATE POLICY "Users manage own submissions" ON submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage submissions" ON submissions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
