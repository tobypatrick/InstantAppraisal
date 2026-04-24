/**
 * PropTrack API Service
 * Calls Next.js API routes which proxy to PropTrack with server-side credentials
 */

const API_TIMEOUT_MS = 5000

export interface AddressSuggestion {
  address: string
  matchScore?: number
  propertyId?: string
  suburb?: string
  state?: string
  postcode?: string
}

export interface PropertyReport {
  reportId?: string
  reportUrl?: string
  propertyId: string
  generatedAt?: string
  estimatedValue?: {
    low: number
    mid: number
    high: number
  }
  suppressed?: boolean
}

export async function suggestAddresses(query: string): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3) return []

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(`/api/proptrack/suggest?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error(`Status ${response.status}`)
    const data = await response.json()
    const raw = Array.isArray(data) ? data : data.suggestions || []
    return raw.map((item: any): AddressSuggestion => {
      const addr = item.address || {}
      const fullAddress = typeof addr === 'string' ? addr : (addr.fullAddress || item.fullAddress || '')
      return {
        address: fullAddress,
        matchScore: item.matchScore,
        propertyId: item.propertyId,
        suburb: addr.suburb || item.suburb,
        state: addr.state || item.state,
        postcode: String(addr.postcode || item.postcode || ''),
      }
    }).filter((s: AddressSuggestion) => s.address.length > 0)
  } catch (error) {
    clearTimeout(timeoutId)
    console.warn('Address suggestion failed:', error)
    throw error
  }
}

export async function generatePropertyReport(propertyId: string, agentId?: string): Promise<PropertyReport> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch('/api/proptrack/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, agent_id: agentId }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      if (response.status === 403 && errorData?.error) {
        const err = new Error(errorData.error)
        ;(err as any).details = errorData
        throw err
      }
      throw new Error(`Report generation failed with status ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
