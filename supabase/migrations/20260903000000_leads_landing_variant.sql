-- Record which variant a lead was captured under.
--
-- The three app emails were reading the variant off the AGENT'S PROFILE, which
-- is wrong in two ways:
--
-- 1. The demo. /demo?variant=rental renders the rental page from the sales demo
--    profile, so the page said rental and every email said sales. Found on a
--    live test, 3 Sept 2026: "A homeowner has completed an instant appraisal
--    ... this is a warm seller lead" on a rental page.
-- 2. Any account that switches variant. A lead captured on a sales page would
--    start receiving rental-worded follow-ups the moment the owner flipped the
--    toggle, retroactively.
--
-- A lead is a record of something that already happened, so it carries the
-- context it happened in. Emails now read this and fall back to the profile for
-- rows captured before this column existed.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS landing_variant text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_landing_variant_check'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_landing_variant_check
      CHECK (landing_variant IS NULL OR landing_variant IN ('sales', 'rental'));
  END IF;
END $$;

-- Deliberately left NULL for existing rows rather than backfilled to 'sales'.
-- NULL means "captured before this was recorded", and the email routes fall
-- back to the profile for those, which is the behaviour those leads already
-- had. Backfilling would assert something we did not actually observe.
