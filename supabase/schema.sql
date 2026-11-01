-- BASOORI GRAPHICS — SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- Run this script inside your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.basoori_site_state (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.basoori_site_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.basoori_site_state;
CREATE POLICY "Public read access"
  ON public.basoori_site_state
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public community review append" ON public.basoori_site_state;
CREATE POLICY "Public community review append"
  ON public.basoori_site_state
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin state update" ON public.basoori_site_state;
CREATE POLICY "Admin state update"
  ON public.basoori_site_state
  FOR UPDATE
  USING (true);
