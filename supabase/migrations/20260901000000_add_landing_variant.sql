-- Property Managers variant.
--
-- Same product, same price, same PropTrack call. The generated report already
-- includes the rental figure, so the only difference is the wording on the
-- agent's landing page. This adds a per-user switch for it.
--
-- Deliberately a NEW column rather than reusing `selected_template`. That
-- column answers "which template", this one answers "which audience", and they
-- are orthogonal — a second template would want both.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS landing_variant text NOT NULL DEFAULT 'sales';

-- Guard the value space at the database, not just in the client.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_landing_variant_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_landing_variant_check
      CHECK (landing_variant IN ('sales', 'rental'));
  END IF;
END $$;

-- Every existing account keeps today's behaviour.
UPDATE public.profiles
   SET landing_variant = 'sales'
 WHERE landing_variant IS NULL;

-- The public landing page reads the profile through this RPC, so the column has
-- to be added to its return table or the page can never see it. RETURNS TABLE
-- means the signature changes, so drop and recreate — same pattern as
-- 20260429000000_add_accent_color.sql, which is the current definition this is
-- based on.
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
