'use client'

import React, { useState, useEffect, useMemo, memo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Users, Mail, Phone, MapPin, Calendar, FileText,
  Globe, QrCode, ExternalLink, Filter,
  ArrowUpDown, X, Check, Tag,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from './StatusBadge'
import { EmptyState } from './EmptyState'
import { TimeoutError } from './TimeoutError'
import { useFlatLeads, useLeadCounts, type Lead } from '@/hooks/useLeads'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

type SortOption = 'newest' | 'oldest'
type StatusFilter = 'all' | 'complete' | 'partial'
type SourceFilter = 'all' | 'facebook' | 'google' | 'qr' | 'direct'
type PipelineStatus = 'contacted' | 'meeting_booked' | 'listed' | 'lost' | null
type PipelineFilter = 'all' | 'contacted' | 'meeting_booked' | 'listed' | 'lost' | 'none'

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Status: All',
  complete: 'Status: Complete',
  partial: 'Status: Partial',
}

const SOURCE_LABELS: Record<SourceFilter, string> = {
  all: 'Source: All',
  facebook: 'Source: Facebook',
  google: 'Source: Google',
  qr: 'Source: QR Code',
  direct: 'Source: Direct',
}

const PIPELINE_LABELS: Record<PipelineFilter, string> = {
  all: 'Pipeline: All',
  contacted: 'Pipeline: Contacted',
  meeting_booked: 'Pipeline: Meeting Booked',
  listed: 'Pipeline: Listed',
  lost: 'Pipeline: Lost',
  none: 'Pipeline: No Status',
}

const PIPELINE_STATUS_CONFIG = {
  contacted: { label: 'Contacted', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  meeting_booked: { label: 'Meeting Booked', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  listed: { label: 'Listed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  lost: { label: 'Lost', className: 'bg-red-50 text-red-700 border-red-200' },
}

function PipelineStatusBadge({ status }: { status: PipelineStatus }) {
  if (!status) return null
  const config = PIPELINE_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}

const getSourceCategory = (lead: Lead): SourceFilter => {
  const source = lead.utm_source?.toLowerCase() || ''
  if (source.includes('facebook') || source.includes('fb')) return 'facebook'
  if (source.includes('google')) return 'google'
  if (source.includes('qr')) return 'qr'
  return 'direct'
}

const getOriginIcon = (lead: Lead) => {
  const source = lead.utm_source?.toLowerCase() || ''
  if (source.includes('facebook') || source.includes('fb')) return <Globe className="h-4 w-4 text-blue-500" strokeWidth={1.25} />
  if (source.includes('google')) return <Globe className="h-4 w-4 text-emerald-500" strokeWidth={1.25} />
  if (source.includes('qr')) return <QrCode className="h-4 w-4 text-slate-500" strokeWidth={1.25} />
  return <Globe className="h-4 w-4 text-slate-400" strokeWidth={1.25} />
}

const LeadFeedComponent = () => {
  const { leads, isLoading, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useFlatLeads()
  const { data: leadCounts } = useLeadCounts()
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [highlightedLead, setHighlightedLead] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>('all')

  const updatePipelineStatus = async (leadId: string, status: PipelineStatus) => {
    const supabase = createClient()
    await supabase.from('leads').update({ pipeline_status: status }).eq('id', leadId)
    queryClient.invalidateQueries({ queryKey: ['leads'] })
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, pipeline_status: status } : null)
    }
  }

  const filteredLeads = useMemo(() => {
    let result = [...leads]
    if (statusFilter !== 'all') result = result.filter(lead => lead.status === statusFilter)
    if (sourceFilter !== 'all') result = result.filter(lead => getSourceCategory(lead) === sourceFilter)
    if (pipelineFilter === 'none') result = result.filter(lead => !lead.pipeline_status)
    else if (pipelineFilter !== 'all') result = result.filter(lead => lead.pipeline_status === pipelineFilter)
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })
    return result
  }, [leads, statusFilter, sourceFilter, pipelineFilter, sortBy])

  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0) + (sourceFilter !== 'all' ? 1 : 0) + (pipelineFilter !== 'all' ? 1 : 0)

  const clearFilters = () => {
    setStatusFilter('all')
    setSourceFilter('all')
    setPipelineFilter('all')
    setSortBy('newest')
  }

  useEffect(() => {
    const highlightId = searchParams.get('highlight')
    if (highlightId && leads.length > 0) {
      const lead = leads.find(l => l.id === highlightId)
      if (lead) {
        setSelectedLead(lead)
        setHighlightedLead(highlightId)
        const timer = setTimeout(() => {
          setHighlightedLead(null)
          router.replace('/dashboard/leads', { scroll: false })
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [searchParams, leads, router])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[120px]" />
            <Skeleton className="h-9 w-[120px]" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[72px] w-full rounded" />)}
      </div>
    )
  }

  if (error) {
    const isTimeoutError = error.message?.includes('timeout') || error.message?.includes('timed out')
    return (
      <TimeoutError
        title={isTimeoutError ? 'Connection Timeout' : 'Failed to Load Leads'}
        message={isTimeoutError ? 'Unable to load your leads. Please check your connection.' : 'Something went wrong while loading leads.'}
        onRetry={() => refetch()}
      />
    )
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <EmptyState
          title="Ready for Launch"
          message="Share your personalised landing page to start capturing leads. Your first lead will appear here."
        />
      </div>
    )
  }

  const completeCount = leadCounts?.complete ?? leads.filter((l) => l.status === 'complete').length
  const incompleteCount = leadCounts?.partial ?? leads.filter((l) => l.status === 'partial').length

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'complete' ? 'all' : 'complete')}
            className={`bg-white border rounded-lg p-4 text-left transition-colors ${statusFilter === 'complete' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <p className="text-xs text-slate-500">Complete Leads</p>
            <p className="text-2xl font-semibold text-emerald-600 mt-1">{completeCount}</p>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'partial' ? 'all' : 'partial')}
            className={`bg-white border rounded-lg p-4 text-left transition-colors ${statusFilter === 'partial' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <p className="text-xs text-slate-500">Incomplete Leads</p>
            <p className="text-2xl font-semibold text-amber-600 mt-1">{incompleteCount}</p>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" strokeWidth={1.25} />
            <h2 className="text-sm font-semibold text-slate-900">Lead Feed</h2>
            <span className="text-xs text-slate-500">({filteredLeads.length} of {leads.length})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <span className="truncate">{STATUS_LABELS[statusFilter]}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: All</SelectItem>
                <SelectItem value="complete">Status: Complete</SelectItem>
                <SelectItem value="partial">Status: Partial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(v) => v && setSourceFilter(v as SourceFilter)}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <span className="truncate">{SOURCE_LABELS[sourceFilter]}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Source: All</SelectItem>
                <SelectItem value="facebook">Source: Facebook</SelectItem>
                <SelectItem value="google">Source: Google</SelectItem>
                <SelectItem value="qr">Source: QR Code</SelectItem>
                <SelectItem value="direct">Source: Direct</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pipelineFilter} onValueChange={(v) => v && setPipelineFilter(v as PipelineFilter)}>
              <SelectTrigger className="h-9 w-[185px] text-xs">
                <span className="truncate">{PIPELINE_LABELS[pipelineFilter]}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Pipeline: All</SelectItem>
                <SelectItem value="contacted">Pipeline: Contacted</SelectItem>
                <SelectItem value="meeting_booked">Pipeline: Meeting Booked</SelectItem>
                <SelectItem value="listed">Pipeline: Listed</SelectItem>
                <SelectItem value="lost">Pipeline: Lost</SelectItem>
                <SelectItem value="none">Pipeline: No Status</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 px-3 inline-flex items-center text-xs border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors font-medium">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
                {sortBy === 'newest' ? 'Newest' : 'Oldest'}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">Sort by Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('newest')} className="text-xs">
                  <Check className={`h-3 w-3 mr-2 ${sortBy === 'newest' ? 'opacity-100' : 'opacity-0'}`} />
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')} className="text-xs">
                  <Check className={`h-3 w-3 mr-2 ${sortBy === 'oldest' ? 'opacity-100' : 'opacity-0'}`} />
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs text-slate-500 hover:text-slate-900">
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {filteredLeads.length === 0 && leads.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
            <Filter className="h-8 w-8 text-slate-300 mx-auto mb-3" strokeWidth={1.25} />
            <p className="text-sm text-slate-500 mb-2">No leads match your filters</p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">Clear Filters</Button>
          </div>
        )}

        {/* Desktop Row Layout */}
        {filteredLeads.length > 0 && (
          <div className="hidden md:block space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all ${highlightedLead === lead.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                id={`lead-${lead.id}`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {getOriginIcon(lead)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" strokeWidth={1.25} />
                      <p className="text-sm font-medium text-slate-900 truncate">{lead.address}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {lead.contact_name && <span className="truncate">{lead.contact_name}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" strokeWidth={1.25} />
                        {format(new Date(lead.created_at), 'd MMM')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={lead.status} />
                  <PipelineStatusBadge status={lead.pipeline_status} />
                  {lead.report_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={(e) => { e.stopPropagation(); window.open(lead.report_url!, '_blank') }}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.25} />
                      View Report
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Card Layout */}
        {filteredLeads.length > 0 && (
          <div className="md:hidden space-y-3 pb-20">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`bg-white border border-slate-200 rounded-lg p-4 active:scale-[0.98] transition-transform cursor-pointer ${highlightedLead === lead.id ? 'ring-2 ring-emerald-500' : ''}`}
                id={`lead-mobile-${lead.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">{lead.address}</p>
                    {lead.contact_name && <p className="text-xs text-slate-500">{lead.contact_name}</p>}
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-[11px] text-slate-400 mb-4">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </p>
                <div className="flex gap-2">
                  {lead.contact_phone && (
                    <a href={`tel:${lead.contact_phone}`} onClick={(e) => e.stopPropagation()} className="flex-1 h-11 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded active:scale-95 transition-transform">
                      <Phone className="h-4 w-4" strokeWidth={1.5} />
                      Call
                    </a>
                  )}
                  {lead.contact_email && (
                    <a href={`mailto:${lead.contact_email}`} onClick={(e) => e.stopPropagation()} className="flex-1 h-11 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded active:scale-95 transition-transform">
                      <Mail className="h-4 w-4" strokeWidth={1.5} />
                      Email
                    </a>
                  )}
                  {!lead.contact_phone && !lead.contact_email && (
                    <div className="flex-1 h-11 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded">
                      No contact info available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center pt-2 pb-4">
            <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="text-xs">
              {isFetchingNextPage ? 'Loading…' : 'Load More Leads'}
            </Button>
          </div>
        )}
      </div>

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <SheetTitle className="text-lg font-semibold">Lead Details</SheetTitle>
            <SheetDescription className="text-sm text-slate-500">
              Full information for this property enquiry.
            </SheetDescription>
          </SheetHeader>

          {selectedLead && (
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Property Address</label>
                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" strokeWidth={1.25} />
                  <p className="text-sm text-slate-900 font-medium">{selectedLead.address}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Status</label>
                <div className="mt-2"><StatusBadge status={selectedLead.status} /></div>
              </div>

              {selectedLead.status === 'complete' && (
                <div>
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Pipeline Status</label>
                  <div className="mt-2">
                    <Select
                      value={selectedLead.pipeline_status || 'none'}
                      onValueChange={(v) => updatePipelineStatus(selectedLead.id, v === 'none' ? null : v as PipelineStatus)}
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="Set pipeline status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Status</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
                        <SelectItem value="listed">Listed</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {(selectedLead.contact_name || selectedLead.contact_email || selectedLead.contact_phone) && (
                <div className="space-y-3">
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Contact Information</label>
                  {selectedLead.contact_name && (
                    <div className="flex items-center gap-2 text-sm text-slate-900">
                      <Users className="h-4 w-4 text-slate-400" strokeWidth={1.25} />
                      {selectedLead.contact_name}
                    </div>
                  )}
                  {selectedLead.contact_email && (
                    <a href={`mailto:${selectedLead.contact_email}`} className="flex items-center gap-2 text-sm text-emerald-600 hover:underline">
                      <Mail className="h-4 w-4" strokeWidth={1.25} />
                      {selectedLead.contact_email}
                    </a>
                  )}
                  {selectedLead.contact_phone && (
                    <a href={`tel:${selectedLead.contact_phone}`} className="flex items-center gap-2 text-sm text-emerald-600 hover:underline">
                      <Phone className="h-4 w-4" strokeWidth={1.25} />
                      {selectedLead.contact_phone}
                    </a>
                  )}
                </div>
              )}

              {selectedLead.interest_level && (
                <div>
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Interest Level</label>
                  <p className="mt-2 text-sm text-slate-900">{selectedLead.interest_level}</p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Date Captured</label>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-900">
                  <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.25} />
                  {format(new Date(selectedLead.created_at), 'd MMMM yyyy, h:mm a')}
                </div>
              </div>

              {selectedLead.utm_source && (
                <div>
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Origin Source</label>
                  <div className="mt-2 flex items-center gap-2">
                    {getOriginIcon(selectedLead)}
                    <span className="text-sm text-slate-900 capitalize">{selectedLead.utm_source}</span>
                  </div>
                </div>
              )}

              {selectedLead.status === 'partial' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  This lead only provided their address. Consider reaching out via alternative channels to gather their contact information.
                </div>
              )}
            </div>
          )}

          {selectedLead && (
            <div className="px-6 py-4 border-t border-slate-100 space-y-3 shrink-0">
              <div className="grid grid-cols-2 gap-3">
                {selectedLead.contact_phone && (
                  <a href={`tel:${selectedLead.contact_phone}`} className="h-12 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded active:scale-95 transition-transform">
                    <Phone className="h-4 w-4" strokeWidth={1.5} />
                    Call Now
                  </a>
                )}
                {selectedLead.contact_email && (
                  <a href={`mailto:${selectedLead.contact_email}`} className="h-12 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded active:scale-95 transition-transform">
                    <Mail className="h-4 w-4" strokeWidth={1.5} />
                    Email
                  </a>
                )}
              </div>
              {selectedLead.report_url && (
                <Button className="w-full h-12 bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-sm font-medium" onClick={() => window.open(selectedLead.report_url!, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" strokeWidth={1.25} />
                  View PropTrack Report
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export const LeadFeed = memo(LeadFeedComponent)
