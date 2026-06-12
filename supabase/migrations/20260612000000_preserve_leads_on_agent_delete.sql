-- Preserve leads when an agent's account is deleted on cancellation.
--
-- Previously leads.agent_id was `NOT NULL ... ON DELETE CASCADE`, so deleting
-- an agent's profile (which the Stripe-cancellation webhook's deleteAgentAccount
-- does) cascade-deleted ALL of that agent's leads — wiping the data we want to
-- keep. The `orphaned = true` flag set just before deletion was useless because
-- the cascade removed the rows entirely.
--
-- Change the FK to ON DELETE SET NULL (and allow NULL) so the lead rows SURVIVE
-- after the agent, profile, billing, analytics and report usage are deleted.
-- Surviving leads end up with agent_id = NULL and orphaned = true (admin-only).

ALTER TABLE public.leads ALTER COLUMN agent_id DROP NOT NULL;

-- Drop the existing agent_id FK by whatever name it has (the original inline
-- constraint is named leads_agent_id_fkey, but resolve it dynamically to be safe).
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.leads'::regclass
    AND contype = 'f'
    AND conkey = ARRAY[(
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'public.leads'::regclass AND attname = 'agent_id'
    )];
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.leads DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_agent_id_fkey
  FOREIGN KEY (agent_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
