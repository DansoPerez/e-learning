-- Enable Row Level Security on all public tables.
--
-- Bravio uses Prisma on the server (Auth.js), not the Supabase Data API from the browser.
-- With RLS enabled and no permissive policies, anon/authenticated PostgREST access is blocked.
-- The postgres / service_role connection used by Prisma bypasses RLS.
--
-- Run once after `npm run db:push`:
--   npm run db:rls
-- Or paste this file into Supabase → SQL Editor → Run.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('_prisma_migrations')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schemaname,
      r.tablename
    );
  END LOOP;
END
$$;

-- Remove broad PostgREST grants from API-facing roles (safe to re-run).
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
