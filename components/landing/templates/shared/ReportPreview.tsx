import { TrendingUp, Home, Clock, BarChart3, DollarSign, LayoutGrid, Users, GraduationCap } from 'lucide-react'

const REPORT_SECTIONS = [
  { icon: TrendingUp, label: 'Estimated Value', desc: 'Instant valuation with confidence rating' },
  { icon: Home, label: 'Property Details', desc: 'Beds, baths, land size & more' },
  { icon: Clock, label: 'Property History', desc: 'Full sold & leased timeline' },
  { icon: BarChart3, label: 'Comparable Sales', desc: 'Recent nearby sales with prices' },
  { icon: DollarSign, label: 'Market Insights', desc: 'Median price, days on market' },
  { icon: LayoutGrid, label: 'Price Guide', desc: 'Breakdown by bedroom count' },
  { icon: Users, label: 'Potential Buyers', desc: 'Live buyer demand from realestate.com.au' },
  { icon: GraduationCap, label: 'Nearby Schools', desc: 'Schools within the catchment area' },
]

interface Props {
  textColorClass: string
  mutedTextClass: string
}

export function ReportPreview({ textColorClass, mutedTextClass }: Props) {
  return (
    <div className="mt-12 w-full landing-fade-in-down" style={{ animationDelay: '0.2s' }}>
      <div className="text-center mb-6">
        <p className={`text-xs font-semibold uppercase tracking-widest ${mutedTextClass} mb-1`}>
          What's in your free report
        </p>
        <p className={`text-[11px] ${mutedTextClass} opacity-60`}>
          Powered by PropTrack — Australia's leading property data provider
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {REPORT_SECTIONS.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Icon className="h-4 w-4 mb-2 text-emerald-400" strokeWidth={1.5} />
            <p className={`text-xs font-medium ${textColorClass} mb-0.5`}>{label}</p>
            <p className={`text-[10px] leading-relaxed ${mutedTextClass} opacity-70`}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
