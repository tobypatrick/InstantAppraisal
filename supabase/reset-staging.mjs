// One-command STAGING reset — deletes all accounts except the test account.
//
// Usage:
//   STAGING_SERVICE_ROLE_KEY=<staging service_role key> npm run reset-staging
//   (or: STAGING_SERVICE_ROLE_KEY=<key> node supabase/reset-staging.mjs)
//
// ⚠️  STAGING ONLY. The project URL is hardcoded to staging, and it ABORTS if
//     the keep-account isn't found — so it can't wipe prod.

import { createClient } from '@supabase/supabase-js'

const STAGING_URL = 'https://snobwvwwgvksbxjpxbhv.supabase.co'
// The test account, and the wrong-project canary. Its absence aborts the run.
const KEEP_EMAIL = 'team+test@instantappraisal.co'

// The public demo accounts survive a reset too, since the marketing site links
// straight at them. Matched on SLUG rather than email deliberately: the slug is
// what makes an account a public demo, and it cannot silently drift the way a
// hardcoded address can when someone changes the login on an account.
const KEEP_SLUGS = ['demo-sales', 'demo-rental']
const KEY = process.env.STAGING_SERVICE_ROLE_KEY

if (!STAGING_URL.includes('snobwvwwgvksbxjpxbhv')) {
  console.error('Refusing: URL is not the staging project.')
  process.exit(1)
}
if (!KEY) {
  console.error('Set STAGING_SERVICE_ROLE_KEY to the staging project service_role key.')
  process.exit(1)
}

const admin = createClient(STAGING_URL, KEY, { auth: { persistSession: false } })

// 1. Find the keep account and collect everyone else (paginated).
const keepIds = []
let primaryKeepId = null
const deleteIds = []

for (let page = 1; ; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
  if (error) {
    console.error('listUsers failed:', error.message)
    process.exit(1)
  }
  if (!data.users.length) break
  for (const u of data.users) {
    if (u.email?.toLowerCase() === KEEP_EMAIL.toLowerCase()) {
      keepIds.push(u.id)
      primaryKeepId = u.id
    } else deleteIds.push(u.id)
  }
  if (data.users.length < 200) break
}

// Wrong-project guard, unchanged from the original.
if (!primaryKeepId) {
  console.error(`ABORT: ${KEEP_EMAIL} not found — wrong project? Refusing to wipe accounts.`)
  process.exit(1)
}

// Now rescue the demo accounts by slug. Done as a second pass because the slug
// lives on profiles, not on the auth user.
const { data: demoProfiles, error: demoErr } = await admin
  .from('profiles')
  .select('id, slug')
  .in('slug', KEEP_SLUGS)
if (demoErr) {
  console.error(`ABORT: could not read demo profiles (${demoErr.message}) — refusing to wipe.`)
  process.exit(1)
}
for (const prof of demoProfiles ?? []) {
  if (keepIds.includes(prof.id)) continue
  keepIds.push(prof.id)
  const idx = deleteIds.indexOf(prof.id)
  if (idx !== -1) deleteIds.splice(idx, 1)
  console.log(`  keeping demo account ${prof.slug}`)
}

console.log(`Keeping ${keepIds.length} account(s); deleting ${deleteIds.length} other account(s)…`)

// 2. Delete dependent data for everyone except the keep account (children first).
const keepList = `(${keepIds.join(',')})`
const wipe = async (table, col) => {
  const { error } = await admin.from(table).delete().not(col, 'in', keepList)
  if (error) console.error(`  ${table} cleanup failed:`, error.message)
}
await wipe('analytics', 'agent_id')
await wipe('report_usage', 'agent_id')
await wipe('leads', 'agent_id')
await admin.from('leads').delete().is('agent_id', null) // orphaned leads
await wipe('billing', 'user_id')
await wipe('profiles', 'id')

// 3. Delete the auth users themselves.
let deleted = 0
for (const id of deleteIds) {
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) console.error('  deleteUser failed', id, error.message)
  else deleted++
}

// 4. Clear rate-limit history (best effort).
const rl = await admin.from('rate_limits').delete().not('id', 'is', null)
if (rl.error) console.warn('  rate_limits not cleared:', rl.error.message)

console.log(`✅ Reset complete — deleted ${deleted} account(s), kept ${keepIds.length}.`)
