import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export const metadata = {
  title: 'See How It Works | InstantAppraisal',
  description: 'See what your branded property appraisal page looks like to homeowners.',
}

// Mock data for the preview
const MOCK_PROFILE = {
  agencyName: 'Smith Real Estate',
  agentName: 'Sarah Smith',
  phone: '0412 345 678',
  headerColor: '#0f172a',
  pageColor: '#020617',
}

const CALLOUTS = [
  { number: '01', title: 'Your agency logo & colours', desc: 'Upload your logo and set your brand colours. Your page looks 100% yours.' },
  { number: '02', title: 'PropTrack address search', desc: 'Powered by Australia\'s most trusted property data. Homeowners search their address in seconds.' },
  { number: '03', title: 'Instant report delivery', desc: 'An estimated value range is delivered immediately. No waiting, no phone calls required.' },
  { number: '04', title: 'Lead capture built-in', desc: 'Contact details are captured before the report is shown. Every enquiry lands in your dashboard.' },
  { number: '05', title: 'Full PropTrack report', desc: 'Comparable sales, market insights, price history, nearby schools — the complete picture.' },
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-sm tracking-tight">INSTANT APPRAISAL</span>
        <Link href="/auth/signup" className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Start Free Trial
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">Live Demo</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Your branded appraisal page</h1>
          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            This is what homeowners see when they visit your page. Every element is customised to your brand.
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left: Browser mockup */}
          <div className="sticky top-8">
            {/* Browser chrome */}
            <div className="rounded-xl overflow-hidden border border-zinc-700 shadow-2xl">
              {/* Browser bar */}
              <div className="bg-zinc-800 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-zinc-700 rounded-md px-3 py-1">
                  <p className="text-xs text-zinc-400 font-mono">my.instantappraisal.co/sarah-smith</p>
                </div>
              </div>

              {/* Page preview */}
              <div style={{ backgroundColor: MOCK_PROFILE.pageColor }} className="relative">
                {/* Mock header */}
                <div style={{ backgroundColor: MOCK_PROFILE.headerColor }} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">SR</span>
                    </div>
                    <span className="text-white text-xs font-semibold">{MOCK_PROFILE.agencyName}</span>
                  </div>
                  <span className="text-white/60 text-[10px]">{MOCK_PROFILE.phone}</span>
                </div>

                {/* Mock content */}
                <div className="px-6 py-10 text-center">
                  <h2 className="text-white text-base font-bold mb-2 leading-tight">
                    Discover Your Property&apos;s<br />New Market Value
                  </h2>
                  <p className="text-white/50 text-xs mb-6">
                    Get a free, no-obligation property report in 30 seconds.
                  </p>

                  {/* Mock search bar */}
                  <div className="bg-white rounded-lg px-3 py-3 flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-slate-400 text-xs">Enter your property address...</span>
                  </div>
                  <div className="bg-emerald-500 rounded-lg py-2.5">
                    <span className="text-white text-xs font-semibold">Get My Free Report →</span>
                  </div>

                  <p className="text-white/30 text-[10px] mt-4">
                    Prepared by {MOCK_PROFILE.agentName} • {MOCK_PROFILE.agencyName}
                  </p>
                </div>

                {/* PropTrack badge mock */}
                <div className="px-4 pb-4 flex justify-center">
                  <div className="border border-white/10 rounded px-3 py-1.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-white/30 text-[9px]">Powered by PropTrack</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Callouts */}
          <div className="space-y-8">
            {CALLOUTS.map((item) => (
              <div key={item.number} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 text-[10px] font-bold">{item.number}</span>
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold mb-1">{item.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-zinc-500 text-xs mt-3">No credit card required. 14-day free trial.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
