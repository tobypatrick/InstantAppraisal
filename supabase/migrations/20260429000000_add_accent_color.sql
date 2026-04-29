-- Add accent_color to profiles so agents can customise the green/highlight
-- colour used throughout their landing page (button, badges, icons, etc.)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#10b981';

-- Backfill any existing rows that have NULL.
UPDATE public.profiles
   SET accent_color = '#10b981'
 WHERE accent_color IS NULL;

-- Update the public profile RPC so the agent landing page can read this field
-- without exposing the rest of the profiles table.
DROP FUNCTION IF EXISTS public.get_public_profile(text);

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_slug text)
RETURNS TABLE (
  id uuid,
  full_name text,
  agency_name text,
  profile_picture_url text,
  agency_logo_url text,
  vsl_youtube_url text,
  selected_template text,
  slug text,
  header_bg_color text,
  page_bg_color text,
  accent_color text,
  facebook_pixel_id text,
  google_tag_manager_id text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.full_name,
    p.agency_name,
    p.profile_picture_url,
    p.agency_logo_url,
    p.vsl_youtube_url,
    p.selected_template,
    p.slug,
    p.header_bg_color,
    p.page_bg_color,
    COALESCE(p.accent_color, '#10b981') AS accent_color,
    p.facebook_pixel_id,
    p.google_tag_manager_id
  FROM public.profiles p
  WHERE p.slug = profile_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;
