-- ============================================================================
--  RESET STAGING  —  delete ALL accounts except the test account
-- ----------------------------------------------------------------------------
--  ⚠️  STAGING ONLY — run in the SQL editor of the STAGING project
--      (snobwvwwgvksbxjpxbhv).
--  ⚠️  NEVER run this on PRODUCTION (vqgzwqrixtesieblrbzy). It deletes every
--      agent account and their data.
--
--  Use: before/after each staging → main release, to clear test accounts.
--
--  Safety: aborts unless team+test@instantappraisal.co exists, so if you
--  accidentally run it on a project without that account (e.g. prod) it does
--  nothing. It also runs as one atomic block — if the guard trips, nothing is
--  deleted.
-- ============================================================================

DO $$
DECLARE
  keep_id uuid;
BEGIN
  SELECT id INTO keep_id
  FROM auth.users
  WHERE email = 'team+test@instantappraisal.co';

  IF keep_id IS NULL THEN
    RAISE EXCEPTION 'ABORT: team+test@instantappraisal.co not found — are you on the STAGING project? Refusing to wipe accounts.';
  END IF;

  -- Delete dependent data first (children before parents), then the users.
  DELETE FROM public.analytics    WHERE agent_id <> keep_id;
  DELETE FROM public.report_usage WHERE agent_id <> keep_id;
  DELETE FROM public.leads        WHERE agent_id IS DISTINCT FROM keep_id; -- also clears orphaned leads
  DELETE FROM public.billing      WHERE user_id  <> keep_id;
  DELETE FROM public.profiles     WHERE id       <> keep_id;
  DELETE FROM auth.users          WHERE id       <> keep_id;

  -- Clear IP rate-limit history so the next round of testing isn't throttled.
  DELETE FROM public.rate_limits;

  RAISE NOTICE 'Staging reset complete — kept only team+test@instantappraisal.co.';
END $$;
