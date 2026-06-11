-- Drop the unused estimated_value column from leads.
-- PropTrack's report endpoint never returned a separate estimate value, so
-- this column was null for every lead in production history. The valuation
-- the homeowner sees lives inside the hosted PropTrack report (report_url).
-- The reveal-estimate feature and get-estimate route that read this column
-- have been removed.
ALTER TABLE public.leads DROP COLUMN IF EXISTS estimated_value;
