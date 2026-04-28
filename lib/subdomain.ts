const MARKETING_HOST = 'instantappraisal.co'
const AGENT_HOST = 'my.instantappraisal.co'
const DASHBOARD_HOST = 'dashboard.instantappraisal.co'

export function getMarketingUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000'
  return `https://${MARKETING_HOST}`
}

export function getDashboardUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000/dashboard/overview'
  if (process.env.NEXT_PUBLIC_DASHBOARD_URL) return process.env.NEXT_PUBLIC_DASHBOARD_URL
  return `https://${DASHBOARD_HOST}`
}

export function getAgentPageUrl(slug: string) {
  if (process.env.NODE_ENV === 'development') return `http://localhost:3000/agent/${slug}`
  return `https://${AGENT_HOST}/${slug}`
}

export function getLoginUrl(redirect?: string) {
  const base = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth/login'
    : `https://${MARKETING_HOST}/auth/login`
  return redirect ? `${base}?redirect=${encodeURIComponent(redirect)}` : base
}

export function getSignupUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000/auth/signup'
  return `https://${MARKETING_HOST}/auth/signup`
}

export function getAgentSubdomainUrl() {
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000/agent'
  return `https://${AGENT_HOST}`
}
