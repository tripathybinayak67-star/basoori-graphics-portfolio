-- BASOORI GRAPHICS — Supabase schema for Cloudflare Pages migration
-- Run this in Supabase Dashboard -> SQL Editor.

CREATE TABLE IF NOT EXISTS public.basoori_site_state (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.basoori_site_state ENABLE ROW LEVEL SECURITY;

-- Public visitors may read the published portfolio state.
-- All writes are performed by the Cloudflare Pages Function using the
-- Supabase service-role key, which bypasses RLS. Never expose that key.
DROP POLICY IF EXISTS "Public read access" ON public.basoori_site_state;
DROP POLICY IF EXISTS "Public community review append" ON public.basoori_site_state;
DROP POLICY IF EXISTS "Admin state update" ON public.basoori_site_state;
DROP POLICY IF EXISTS "Public state read" ON public.basoori_site_state;
CREATE POLICY "Public state read"
  ON public.basoori_site_state
  FOR SELECT
  TO anon, authenticated
  USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.basoori_site_state FROM anon, authenticated;
GRANT SELECT ON public.basoori_site_state TO anon, authenticated;
