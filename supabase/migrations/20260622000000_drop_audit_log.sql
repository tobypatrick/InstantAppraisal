-- Remove the audit_log table. The admin moved to a standalone app at
-- admin.instantappraisal.co and no longer uses it.
--
-- IMPORTANT: a trigger (audit_profile_update → audit_profile_changes) on the
-- profiles table wrote a row into audit_log on every update. It was created
-- directly in the database, not via a migration. It MUST be dropped first, or
-- every profile save fails once the table is gone.
DROP TRIGGER IF EXISTS audit_profile_update ON public.profiles;
DROP FUNCTION IF EXISTS public.audit_profile_changes() CASCADE;

DROP TABLE IF EXISTS public.audit_log CASCADE;
