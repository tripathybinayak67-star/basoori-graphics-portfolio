-- ============================================================================
-- BASOORI GRAPHICS — SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Run this script inside your Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_state (
  id TEXT PRIMARY KEY DEFAULT 'main',
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  channel_url TEXT,
  avatar_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_reviews ENABLE ROW LEVEL SECURITY;

-- Public visitors can read site configuration & visible reviews
CREATE POLICY "Public read site_state" ON site_state
  FOR SELECT USING (true);

CREATE POLICY "Public read visible reviews" ON public_reviews
  FOR SELECT USING (hidden = false);

-- Public visitors can submit UNVERIFIED community reviews only
CREATE POLICY "Public insert unverified review" ON public_reviews
  FOR INSERT WITH CHECK (verified = false AND hidden = false);
