// Server-side module — token cached in Node.js module scope (persists per Vercel function instance)
let cachedToken: string | null = null
let tokenExpiresAt = 0
const EXPIRY_BUFFER_MS = 60_000

export async function getPropTrackToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - EXPIRY_BUFFER_MS) {
    return cachedToken
  }

  const key = process.env.PROPTRACK_KEY
  const secret = process.env.PROPTRACK_SECRET
  const baseUrl = process.env.PROPTRACK_BASE_URL

  if (!key || !secret || !baseUrl) {
    throw new Error('Missing PROPTRACK_KEY, PROPTRACK_SECRET, or PROPTRACK_BASE_URL env vars')
  }

  const credentials = Buffer.from(`${key}:${secret}`).toString('base64')

  const response = await fetch(`${baseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`PropTrack token request failed: ${response.status} ${body}`)
  }

  const data = await response.json()
  cachedToken = data.access_token as string
  const expiresInMs = (data.expires_in || 3600) * 1000
  tokenExpiresAt = Date.now() + expiresInMs

  return cachedToken
}
