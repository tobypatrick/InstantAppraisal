// All three base URLs are driven by env vars so staging/preview deployments
// can point to their own subdomains without touching this file.
//
// Production (Vercel → Production environment):
//   NEXT_PUBLIC_MARKETING_URL = https://instantappraisal.co
//   NEXT_PUBLIC_DASHBOARD_URL = https://dashboard.instantappraisal.co
//   NEXT_PUBLIC_AGENT_URL     = https://my.instantappraisal.co
//
// Staging (Vercel → Preview environment, scoped to "staging" branch):
//   NEXT_PUBLIC_MARKETING_URL = https://staging.instantappraisal.co
//   NEXT_PUBLIC_DASHBOARD_URL = https://staging-dashboard.instantappraisal.co
//   NEXT_PUBLIC_AGENT_URL     = https://staging-my.instantappraisal.co

const MARKETING_HOST = 'instantappraisal.co'
const AGENT_HOST = 'my.instantappraisal.co'
const DASHBOARD_HOST = 'dashboard.instantappraisal.co'

export function getMarketingUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000'
  if (process.env.NEXT_PUBLIC_MARKETING_URL) return process.env.NEXT_PUBLIC_MARKETING_URL
  return `https://${MARKETING_HOST}`
}

export function getDashboardUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000/dashboard/overview'
  if (process.env.NEXT_PUBLIC_DASHBOARD_URL) return process.env.NEXT_PUBLIC_DASHBOARD_URL
  return `https://${DASHBOARD_HOST}`
}

export function getAgentPageUrl(slug: string) {
  if (process.env.NODE_ENV === 'development') return `http://localhost:3000/agent/${slug}`
  if (process.env.NEXT_PUBLIC_AGENT_URL) return `${process.env.NEXT_PUBLIC_AGENT_URL}/${slug}`
  return `https://${AGENT_HOST}/${slug}`
}

export function getLoginUrl(redirect?: string) {
  const base = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth/login'
    : `${getMarketingUrl()}/auth/login`
  return redirect ? `${base}?redirect=${encodeURIComponent(redirect)}` : base
}

export function getSignupUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000/auth/signup'
  return `${getMarketingUrl()}/auth/signup`
}

export function getAgentSubdomainUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000/agent'
  if (process.env.NEXT_PUBLIC_AGENT_URL) return process.env.NEXT_PUBLIC_AGENT_URL
  return `https://${AGENT_HOST}`
}
