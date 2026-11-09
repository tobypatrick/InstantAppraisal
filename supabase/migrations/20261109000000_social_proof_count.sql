-- The number in the landing page's "Used by N+ homeowners this week" line.
-- NULL means the agent hasn't set one, and the app shows its default.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_proof_count integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_social_proof_count_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_social_proof_count_check
      CHECK (social_proof_count IS NULL OR social_proof_count BETWEEN 1 AND 99999);
  END IF;
END $$;

-- The public page reads the profile through this RPC, so the column has to be
-- on its return table. The signature changes, so drop and recreate.
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
  landing_variant text,
  social_proof_count integer,
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
    COALESCE(p.landing_variant, 'sales') AS landing_variant,
    p.social_proof_count,
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
