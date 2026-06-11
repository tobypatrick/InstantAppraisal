-- Per-agent toggle for the homeowner confirmation email (vendor-confirmation).
-- Defaults to true so existing agents keep sending it.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS send_vendor_email boolean NOT NULL DEFAULT true;
