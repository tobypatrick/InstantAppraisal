-- Public demo accounts: demo-sales and demo-rental.
--
-- The marketing site links straight at both slugs (marketing-header.tsx, the
-- hero on app/page.tsx, and the /demo and /demo/rental redirects), so if either
-- profile is missing those links 404. Neither account is created by a code
-- deploy, because accounts are DATA — this is the piece that does not travel
-- with a staging -> main merge, the same way migrations do not.
--
-- Run it on staging first, then on prod with sign-off:
--   sed 's/__DEMO_RENTAL_PASSWORD__/<a real password>/' supabase/seed-demo-accounts.sql > /tmp/seed.sql
--   supabase db query --linked -f /tmp/seed.sql && rm /tmp/seed.sql
--
-- Idempotent in both halves. Safe to re-run: the rename only fires while a
-- 'demo' row still exists, and the create only fires while 'demo-rental' does
-- not. Re-running never resets a password or overwrites branding.

BEGIN;

-- 1. The old 'demo' account BECOMES 'demo-sales'.
--
-- A rename, deliberately, not a new account. It keeps its LeadConnector
-- webhook, its notification email and its branding, none of which would
-- survive being mirrored by hand. Its login is team+test@instantappraisal.co.
UPDATE public.profiles
   SET slug = 'demo-sales'
 WHERE slug = 'demo'
   AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE slug = 'demo-sales');

-- 2. demo-rental, a real second account rather than a ?variant= override.
--
-- The override was removed on 3 Sept 2026 because it only ever changed what
-- rendered: the email routes read the profile, so the rental demo page sent
-- "warm seller lead" wording. A real account exercises the actual toggle end to
-- end, which is the only version of this demo worth showing anyone.
DO $$
DECLARE
  v_user_id uuid := extensions.gen_random_uuid();
  v_email   text := 'team+demorental@instantappraisal.co';
  v_sales   public.profiles%ROWTYPE;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE slug = 'demo-rental') THEN
    RAISE NOTICE 'demo-rental already exists, leaving it alone';
    RETURN;
  END IF;

  -- An existing auth user with this address but no demo-rental profile means a
  -- half-finished previous run. Adopt it rather than colliding on the unique
  -- email, so a partial failure can be repaired by re-running.
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := extensions.gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, is_sso_user, is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id,
      'authenticated', 'authenticated', v_email,
      extensions.crypt('__DEMO_RENTAL_PASSWORD__', extensions.gen_salt('bf')),
      -- Confirmed on creation. Email confirmation is switched OFF in both
      -- environments and must stay off; an unconfirmed row would be a second,
      -- silent way to break login.
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      jsonb_build_object(
        'sub', v_user_id::text, 'email', v_email,
        'full_name', 'Rental Demo', 'email_verified', true, 'phone_verified', false
      ),
      now(), now(), false, false
    );

    -- Without the identity row the user exists and cannot log in, which fails
    -- silently and looks exactly like a wrong password.
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at,
      created_at, updated_at
    ) VALUES (
      v_user_id::text, v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text, 'email', v_email,
        'full_name', 'Rental Demo', 'email_verified', false, 'phone_verified', false
      ),
      'email', now(), now(), now()
    );
  END IF;

  -- on_auth_user_created has already inserted a profile with a derived slug.
  -- Clone the sales demo's look so the two demos differ only in the variant,
  -- which is the whole point of showing them side by side.
  SELECT * INTO v_sales FROM public.profiles WHERE slug = 'demo-sales';

  UPDATE public.profiles
     SET slug                      = 'demo-rental',
         landing_variant           = 'rental',
         full_name                 = COALESCE(v_sales.full_name, 'Your Full Name'),
         agency_name               = COALESCE(v_sales.agency_name, 'Your Agency Name'),
         selected_template         = COALESCE(v_sales.selected_template, 'data_hub'),
         header_bg_color           = COALESCE(v_sales.header_bg_color, '#000000'),
         page_bg_color             = COALESCE(v_sales.page_bg_color, '#ffffff'),
         accent_color              = COALESCE(v_sales.accent_color, '#059669'),
         agency_logo_url           = v_sales.agency_logo_url,
         profile_picture_url       = v_sales.profile_picture_url,
         leadconnector_webhook_url = v_sales.leadconnector_webhook_url,
         notification_email        = v_sales.notification_email,
         send_vendor_email         = COALESCE(v_sales.send_vendor_email, true),
         first_login               = false
   WHERE id = v_user_id;
END $$;

COMMIT;

-- Verification, printed by the run rather than trusted.
SELECT slug, full_name, landing_variant, notification_email
  FROM public.profiles
 WHERE slug IN ('demo', 'demo-sales', 'demo-rental')
 ORDER BY slug;
