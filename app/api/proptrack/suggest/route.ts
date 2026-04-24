import { NextRequest, NextResponse } from 'next/server'
import { getPropTrackToken } from '@/lib/proptrack-token'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const token = await getPropTrackToken()
    const baseUrl = process.env.PROPTRACK_BASE_URL

    if (!baseUrl) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const res = await fetch(
      `${baseUrl}/api/v2/address/suggest?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!res.ok) {
      const body = await res.text()
      console.error('PropTrack suggest error:', res.status, body)
      return NextResponse.json({ error: 'PropTrack API error', status: res.status }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('proptrack/suggest error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
