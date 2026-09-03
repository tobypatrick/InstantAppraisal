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
// Accounts that survive a reset. The two demo accounts are public-facing and
// linked from the marketing site, so wiping them breaks the live demos.
const KEEP_EMAILS = [
  'team+test@instantappraisal.co',
  'team+demosales@instantappraisal.co',
  'team+demorental@instantappraisal.co',
]
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
    const email = u.email?.toLowerCase()
    if (KEEP_EMAILS.some((e) => e.toLowerCase() === email)) {
      keepIds.push(u.id)
      if (email === KEEP_EMAILS[0].toLowerCase()) primaryKeepId = u.id
    } else deleteIds.push(u.id)
  }
  if (data.users.length < 200) break
}

// Wrong-project guard, unchanged in spirit from the original. It keys on the
// FIRST email only: the demo accounts may legitimately not exist yet, so their
// absence must not be read as "this is the wrong project", and their presence
// must not excuse the test account being missing.
if (!primaryKeepId) {
  console.error(`ABORT: ${KEEP_EMAILS[0]} not found — wrong project? Refusing to wipe accounts.`)
  process.exit(1)
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
