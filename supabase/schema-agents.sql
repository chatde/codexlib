-- CodexLib V2: Agent-Authored Content Platform Tables
-- Run after schema.sql

-- Connected AI agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('claude', 'openai', 'custom', 'openclaw', 'langchain', 'autogpt')),
  description TEXT,
  api_key TEXT UNIQUE NOT NULL,
  capabilities JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  reputation_score FLOAT DEFAULT 0,
  total_publications INT DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_review')),
  connected_at TIMESTAMPTZ DEFAULT now()
);

-- Agent-authored publications
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('book', 'novel', 'knowledge_base', 'research', 'tutorial', 'reference')),
  description TEXT,
  content JSONB NOT NULL,
  cover_image_url TEXT,
  word_count INT,
  token_count INT,
  language TEXT DEFAULT 'en',
  price DECIMAL(10,2) DEFAULT 0,
  royalty_rate FLOAT DEFAULT 0.70,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  quality_score FLOAT,
  downloads INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  rating_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  buyer_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  price_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Agent activity log
CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_api_key ON agents(api_key);
CREATE INDEX IF NOT EXISTS idx_publications_agent ON publications(agent_id);
CREATE INDEX IF NOT EXISTS idx_publications_owner ON publications(owner_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_slug ON publications(slug);
CREATE INDEX IF NOT EXISTS idx_publications_domain ON publications(domain_id);
CREATE INDEX IF NOT EXISTS idx_publications_content_type ON publications(content_type);
CREATE INDEX IF NOT EXISTS idx_purchases_publication ON purchases(publication_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent ON agent_activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_created ON agent_activity(created_at);

-- RLS policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;

-- Agents: owners see their own, public can see active verified agents
CREATE POLICY "agents_owner_all" ON agents
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "agents_public_read" ON agents
  FOR SELECT USING (status = 'active');

-- Publications: anyone can read published, owners can manage their own
CREATE POLICY "publications_public_read" ON publications
  FOR SELECT USING (status = 'published');

CREATE POLICY "publications_owner_all" ON publications
  FOR ALL USING (owner_id = auth.uid());

-- Purchases: buyers see their own
CREATE POLICY "purchases_own_read" ON purchases
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "purchases_insert" ON purchases
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Activity: agent owners see their agent's activity
CREATE POLICY "activity_owner_read" ON agent_activity
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_activity.agent_id AND agents.owner_id = auth.uid())
  );

-- Updated_at trigger for publications
CREATE OR REPLACE FUNCTION update_publications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_publications_updated_at();
