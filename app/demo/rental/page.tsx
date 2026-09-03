import { redirect } from 'next/navigation'
import { getAgentPageUrl } from '@/lib/subdomain'

// The rental demo for property management BDMs.
//
// Its own account (slug demo-rental) with landing_variant set to rental, so the
// demo exercises the real toggle rather than a preview flag. Superseded the
// earlier ?variant=rental override on the shared demo profile, Toby 3 Sept 2026,
// because that never reached the email routes and could not show the backend.
//
// The two demo accounts must be kept in step by hand: branding, LeadConnector
// webhook, notification email, pixel and GTM. See supabase/reset-staging.mjs,
// which protects both from a staging reset.
export default function RentalDemoRedirect() {
  redirect(getAgentPageUrl('demo-rental'))
}
