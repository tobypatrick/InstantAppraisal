import type { MetadataRoute } from 'next'

// Robots for the marketing host (instantappraisal.co). The agent (my.),
// dashboard and admin subdomains serve their own robots from proxy.ts — the
// agent host allows crawling but carries X-Robots-Tag: noindex so its pages are
// dropped from search, dashboard/admin are disallowed entirely.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://instantappraisal.co/sitemap.xml',
    host: 'https://instantappraisal.co',
  }
}
