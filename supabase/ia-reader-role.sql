-- A read-only role for the Agent Growth lead refresh.
--
-- WHY. Agent Growth's nightly import reads two tables out of InstantAppraisal,
-- public.profiles and public.leads, to pull the seller leads for STRUD Property
-- agents. Until now it did that with the `service_role` key, which bypasses row
-- level security entirely and carries full read AND write across the whole
-- database: every agent account, every homeowner lead, names, phones, emails,
-- addresses.
--
-- Our code only ever reads, and only those two tables. That is our code being
-- well behaved, not the key being limited. This makes the key match the job.
--
-- WHAT THIS DOES NOT DO. It creates nothing that can write, drops nothing, and
-- changes no existing grant. `service_role` keeps working exactly as it does
-- today, so nothing breaks while the new key is being proven.
--
-- Run on STAGING first (snobwvwwgvksbxjpxbhv), prove the key, then production
-- (vqgzwqrixtesieblrbzy) with sign-off. Roles are per database, so each project
-- needs its own run.

-- 1. The role itself. NOLOGIN because nothing connects as it directly; PostgREST
--    switches into it from `authenticator` based on the JWT's role claim.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ia_reader') THEN
    CREATE ROLE ia_reader NOLOGIN NOINHERIT;
  END IF;
END $$;

-- 2. Reach the schema, but nothing in it by default.
GRANT USAGE ON SCHEMA public TO ia_reader;

-- 3. SELECT on exactly two tables, named one at a time. Deliberately NOT
--    "ALL TABLES IN SCHEMA": that would silently grant every table added in
--    future, which is the same open-ended access this exists to remove.
GRANT SELECT ON TABLE public.profiles TO ia_reader;
GRANT SELECT ON TABLE public.leads    TO ia_reader;

-- 4. Let PostgREST assume the role. Without this the JWT authenticates and then
--    fails to switch, which looks exactly like a bad key.
GRANT ia_reader TO authenticator;

-- 5. Row level security still applies to this role, unlike service_role which
--    bypasses it. Nothing here disables it, and that is the point.

-- Prove it rather than assume it: what can ia_reader actually touch?
SELECT table_name, privilege_type
  FROM information_schema.role_table_grants
 WHERE grantee = 'ia_reader'
 ORDER BY table_name, privilege_type;
