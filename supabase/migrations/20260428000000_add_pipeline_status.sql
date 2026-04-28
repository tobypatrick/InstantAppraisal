-- Add pipeline_status column to leads table
-- Tracks an agent's follow-up stage for each lead, separate from the system status field

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS pipeline_status text
  CHECK (pipeline_status IN ('contacted', 'meeting_booked', 'listed', 'lost'));
