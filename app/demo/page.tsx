import { redirect } from 'next/navigation'
import { getAgentPageUrl } from '@/lib/subdomain'

// The marketing demo now lives on the agent subdomain
// (my.instantappraisal.co/demo in prod, staging-my.* in staging).
// Anyone hitting the old /demo URL — including existing ads and
// inbound links — is redirected to the live agent-page demo.
export default function DemoRedirect() {
  redirect(getAgentPageUrl('demo'))
}
