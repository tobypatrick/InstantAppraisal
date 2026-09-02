-- Rental interest levels for the property management variant.
--
-- On a rental page "Looking to Sell" is meaningless. A BDM needs to know the
-- property's STATUS, because that is what says whether the management can be
-- won and how soon: vacant is urgent, self-managed has no incumbent agency to
-- displace, agency-managed waits on the agreement lapsing.
--
-- leads.interest_level was created with an inline CHECK pinning the two sales
-- values, so the new options are rejected by the database until this runs.
-- Original definition, from the first Lovable migration:
--   interest_level TEXT CHECK (interest_level IN ('Looking to Sell', 'Just Interested'))

-- The original constraint was created inline and therefore auto-named, so find
-- it rather than assuming. This drops ANY check constraint on leads that
-- references interest_level, which is exactly the one we mean to replace.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'leads'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%interest_level%'
  LOOP
    EXECUTE format('ALTER TABLE public.leads DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

-- One named constraint covering both variants. Existing rows all carry a sales
-- value, so nothing needs backfilling.
ALTER TABLE public.leads
  ADD CONSTRAINT leads_interest_level_check
  CHECK (
    interest_level IS NULL
    OR interest_level IN (
      -- sales
      'Looking to Sell',
      'Just Interested',
      -- rental
      'Tenanted, managed by an agency',
      'Tenanted, I manage it myself',
      'Vacant or between tenants',
      'I live in it'
    )
  );
