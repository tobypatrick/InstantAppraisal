import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ exists: false })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    }
  )

  if (!res.ok) return NextResponse.json({ exists: false })
  const data = await res.json()
  return NextResponse.json({ exists: (data?.users?.length ?? 0) > 0 })
}
