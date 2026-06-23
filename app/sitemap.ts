import type { MetadataRoute } from 'next'

const BASE = 'https://instantappraisal.co'

// Public marketing pages only. Agent (my.) and dashboard/admin pages are
// intentionally excluded and kept out of search — see proxy.ts (X-Robots-Tag
// noindex on the agent host, robots.txt disallow on dashboard/admin).
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/privacy', '/terms'].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.5,
  }))
}
