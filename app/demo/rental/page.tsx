import { redirect } from 'next/navigation'
import { getAgentPageUrl } from '@/lib/subdomain'

// The rental demo for property management BDMs.
//
// Deliberately the SAME demo profile as /demo, rendered in the rental variant,
// rather than a second demo account. The profile carries the LeadConnector
// webhook, notification email, pixel and GTM ids, the vendor-email toggle and
// the billing row that lets reports generate, so sharing one account is what
// keeps the two demos behaving identically. A second account would be a copy of
// all of that, and copies drift.
export default function RentalDemoRedirect() {
  redirect(`${getAgentPageUrl('demo')}?variant=rental`)
}
