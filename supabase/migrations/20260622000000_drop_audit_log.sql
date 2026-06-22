-- Remove the audit_log table. The admin moved to a standalone app at
-- admin.instantappraisal.co and no longer uses it. No triggers or functions
-- write to this table, so the drop is self-contained.
DROP TABLE IF EXISTS public.audit_log CASCADE;
