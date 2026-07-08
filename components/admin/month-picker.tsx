'use client'

import { useRouter } from 'next/navigation'

// Dropdown of specific calendar months (e.g. "March 2026"). Selecting one
// navigates to ?month=YYYY-MM, which the overview page reads as a fixed window.
// The 7/30/90/All toggle uses ?range instead, so the two are mutually exclusive.
export function MonthPicker({
  months,
  active,
}: {
  months: { key: string; label: string }[]
  active: string | null
}) {
  const router = useRouter()
  return (
    <select
      value={active ?? ''}
      onChange={(e) => {
        if (e.target.value) router.push(`?month=${e.target.value}`)
      }}
      className={`h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      <option value="">By month…</option>
      {months.map((m) => (
        <option key={m.key} value={m.key}>
          {m.label}
        </option>
      ))}
    </select>
  )
}
