import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Toggle an agent's Agent Growth flag. Admin only.
export async function POST(request: NextRequest) {
  // The caller must be a signed-in admin.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, value } = await request.json()
  if (!userId || typeof value !== 'boolean') {
    return NextResponse.json({ error: 'Missing userId or value' }, { status: 400 })
  }

  // Service role to write billing (bypasses RLS). Upsert only touches the flag,
  // so an existing billing row keeps its subscription fields.
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const { error } = await admin
    .from('billing')
    .upsert({ user_id: userId, is_agent_growth: value }, { onConflict: 'user_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
