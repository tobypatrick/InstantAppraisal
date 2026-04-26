'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Shield, ChevronLeft, ChevronRight, Filter, Clock, Activity } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import { useAuditLogs, type AuditLogEntry } from '@/hooks/useAuditLogs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const ITEMS_PER_PAGE = 20

const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  asset_upload: { label: 'Asset Upload', variant: 'default' },
  asset_delete: { label: 'Asset Delete', variant: 'destructive' },
  profile_update: { label: 'Profile Update', variant: 'secondary' },
  lead_delete: { label: 'Lead Delete', variant: 'destructive' },
  login: { label: 'Login', variant: 'outline' },
  logout: { label: 'Logout', variant: 'outline' },
}

function ActionBadge({ action }: { action: string }) {
  const config = ACTION_LABELS[action] || { label: action, variant: 'default' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function AuditRow({ log }: { log: AuditLogEntry }) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">{log.user_id.slice(0, 8)}…</TableCell>
      <TableCell><ActionBadge action={log.action} /></TableCell>
      <TableCell className="capitalize">{log.entity_type}</TableCell>
      <TableCell className="font-mono text-xs">{log.entity_id ? `${log.entity_id.slice(0, 8)}…` : '—'}</TableCell>
      <TableCell>
        {log.details ? (
          <pre className="text-xs bg-muted p-2 rounded max-w-xs overflow-auto max-h-20">{JSON.stringify(log.details, null, 2)}</pre>
        ) : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{log.ip_address || '—'}</TableCell>
      <TableCell className="text-xs">{format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}</TableCell>
    </TableRow>
  )
}

export default function AdminAuditLogPage() {
  const { isAdmin, isLoading: roleLoading } = useUserRole()
  const [page, setPage] = useState(0)
  const [actionFilter, setActionFilter] = useState<string>('all')

  const { data, isLoading, error } = useAuditLogs({
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
    action: actionFilter !== 'all' ? actionFilter : undefined,
  })

  if (!roleLoading && !isAdmin) {
    redirect('/dashboard/overview')
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Shield className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Security Audit Log</h1>
          <p className="text-sm text-slate-500">Monitor all sensitive actions across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : (data?.total || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{page + 1} / {totalPages || 1}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Filter</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={actionFilter} onValueChange={(v) => v && setActionFilter(v)}>
              <SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="asset_upload">Asset Upload</SelectItem>
                <SelectItem value="asset_delete">Asset Delete</SelectItem>
                <SelectItem value="profile_update">Profile Update</SelectItem>
                <SelectItem value="lead_delete">Lead Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Events</CardTitle>
          <CardDescription>Detailed log of all sensitive actions performed by users</CardDescription>
        </CardHeader>
        <CardContent>
          {roleLoading || isLoading ? (
            <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">Failed to load audit logs.</div>
          ) : !data?.logs.length ? (
            <div className="text-center py-8 text-muted-foreground">No audit events found.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => <AuditRow key={log.id} log={log} />)}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, data.total)} of {data.total} events
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4" />Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                    Next<ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
