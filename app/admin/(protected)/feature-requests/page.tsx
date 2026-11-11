import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'Feature requests | Admin' }

// Always live. A stale build-time snapshot of a queue is worse than no queue.
export const dynamic = 'force-dynamic'

type FeatureRequest = {
  id: string
  requester_name: string
  requester_email: string | null
  requester_note: string | null
  request: string
  source: string
  status: 'new' | 'planned' | 'shipped' | 'declined'
  shipped_at: string | null
  told_requester_at: string | null
  notes: string | null
  created_at: string
}

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmt = (s: string | null) => {
  if (!s) return null
  const d = new Date(s)
  return `${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`
}
const daysSince = (s: string) => Math.floor((Date.now() - Date.parse(s)) / 864e5)

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// Marking somebody told is the action that was missing, so it is the one the
// page makes cheap. Everything else can be edited in the database.
async function markTold(formData: FormData) {
  'use server'
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await admin()
    .from('feature_requests')
    .update({ told_requester_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/feature-requests')
}

async function setStatus(formData: FormData) {
  'use server'
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !['new', 'planned', 'shipped', 'declined'].includes(status)) return
  await admin()
    .from('feature_requests')
    .update({
      status,
      // Stamp the ship date the first time it is marked shipped, so "shipped
      // and never told" can be aged rather than just listed.
      ...(status === 'shipped' ? { shipped_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  revalidatePath('/feature-requests')
}

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-slate-100 text-slate-700',
  planned: 'bg-blue-50 text-blue-700',
  shipped: 'bg-emerald-50 text-emerald-700',
  declined: 'bg-slate-100 text-slate-500',
}

function Card({ r, owed }: { r: FeatureRequest; owed: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${owed ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-medium text-slate-900">
          {r.requester_name}
          {r.requester_note ? <span className="ml-2 text-sm text-slate-500">{r.requester_note}</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-xs uppercase tracking-wide ${STATUS_STYLE[r.status]}`}>
            {r.status}
          </span>
          <span className="text-xs text-slate-400">{r.source}</span>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-700">{r.request}</p>
      {r.notes ? <p className="mt-2 text-sm text-slate-500">{r.notes}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>raised {fmt(r.created_at)} ({daysSince(r.created_at)}d)</span>
        {r.shipped_at ? <span>shipped {fmt(r.shipped_at)}</span> : null}
        {r.told_requester_at ? (
          <span className="text-emerald-700">told {fmt(r.told_requester_at)}</span>
        ) : (
          <span className="text-amber-700">not told</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!r.told_requester_at && (
          <form action={markTold}>
            <input type="hidden" name="id" value={r.id} />
            <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
              Mark the requester told
            </button>
          </form>
        )}
        {(['new', 'planned', 'shipped', 'declined'] as const)
          .filter((s) => s !== r.status)
          .map((s) => (
            <form action={setStatus} key={s}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="status" value={s} />
              <button className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50">
                {s}
              </button>
            </form>
          ))}
      </div>
    </div>
  )
}

export default async function FeatureRequestsPage() {
  const { data, error } = await admin()
    .from('feature_requests')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    // Loud, not an empty page. An empty queue and a broken query look identical
    // and mean opposite things.
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        Could not read feature requests: {error.message}
        <div className="mt-1 text-red-600">
          If this says the relation does not exist, migration 20260907000000_feature_requests.sql
          has not been applied to this environment.
        </div>
      </div>
    )
  }

  const rows = (data ?? []) as FeatureRequest[]
  const owed = rows.filter((r) => r.status === 'shipped' && !r.told_requester_at)
  const open = rows.filter((r) => r.status === 'new' || r.status === 'planned')
  const done = rows.filter((r) => !owed.includes(r) && !open.includes(r))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Feature requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          What paying users have asked for, and whether anybody told them what happened.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-amber-700">
          Shipped, and the requester has not been told ({owed.length})
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The one that keeps happening. The work is done and the person who asked for it does not
          know.
        </p>
        <div className="mt-3 space-y-3">
          {owed.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing owed a reply.</p>
          ) : (
            owed.map((r) => <Card key={r.id} r={r} owed />)
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-600">
          Open ({open.length})
        </h2>
        <div className="mt-3 space-y-3">
          {open.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing open.</p>
          ) : (
            open.map((r) => <Card key={r.id} r={r} owed={false} />)
          )}
        </div>
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-600">
            Closed ({done.length})
          </h2>
          <div className="mt-3 space-y-3">
            {done.map((r) => (
              <Card key={r.id} r={r} owed={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
