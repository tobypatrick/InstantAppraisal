-- Agent Growth: comped free accounts, toggled from the admin.
-- Lives on billing so the Stripe webhook (which only updates its own columns on
-- conflict) never overwrites it. These accounts get access without paying and
-- are tracked as free, so they are excluded from MRR and the paid/trial counts.
ALTER TABLE public.billing
  ADD COLUMN IF NOT EXISTS is_agent_growth boolean NOT NULL DEFAULT false;
