import Link from 'next/link'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/marketing-header'

export const metadata = {
  title: 'Live Demo | InstantAppraisal',
  description: 'See what your branded property appraisal page looks like to homeowners.',
}

const ANNOTATIONS = [
  {
    number: '1',
    title: 'Your logo and brand colours',
    desc: 'Upload your logo, set your header and page colour. Looks 100% like yours.',
    position: 'top-[52px] left-[-20px] md:left-[-200px]',
    dot: 'top-[68px] left-[60px]',
    side: 'left',
  },
  {
    number: '2',
    title: 'Instant PropTrack address search',
    desc: "Homeowners search their address using Australia's most trusted property data.",
    position: 'top-[280px] right-[-20px] md:right-[-200px]',
    dot: 'top-[298px] right-[60px]',
    side: 'right',
  },
  {
    number: '3',
    title: 'Lead capture built in',
    desc: 'Name, email, and phone are collected before the report is shown. Every enquiry goes straight to your dashboard.',
    position: 'top-[390px] left-[-20px] md:left-[-200px]',
    dot: 'top-[408px] left-[60px]',
    side: 'left',
  },
  {
    number: '4',
    title: 'Your unique URL',
    desc: 'Share my.instantappraisal.co/your-name in ads, emails, and letterbox drops.',
    position: 'top-[-16px] right-[-20px] md:right-[-200px]',
    dot: 'top-[4px] right-[110px]',
    side: 'right',
  },
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <MarketingHeader />

      {/* Intro */}
      <div className="py-16 text-center px-4">
        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">Live Demo</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3 tracking-tight">
          This is your branded appraisal page
        </h1>
        <p className="text-zinc-400 text-base max-w-lg mx-auto">
          Every element below is customised to your brand. Homeowners see this when they click your link.
        </p>
      </div>

      {/* Full-width annotated agent page */}
      <div className="relative max-w-2xl mx-auto px-4 pb-16 md:px-16">

        {/* Browser chrome */}
        <div className="rounded-2xl overflow-hidden border border-zinc-700 shadow-[0_0_80px_rgba(0,0,0,0.6)]">

          {/* URL bar */}
          <div className="relative bg-zinc-800 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="flex-1 bg-zinc-700/60 rounded-md px-3 py-1.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-300 font-mono">my.instantappraisal.co/sarah-smith</span>
            </div>

            {/* Annotation 4 — URL bar */}
            <div className="hidden md:block absolute right-[-220px] top-[-4px] w-[200px]">
              <AnnotationCard number="4" title="Your unique URL" desc="Share in ads, emails, and letterbox drops." side="right" />
            </div>
            <div className="hidden md:block absolute right-[120px] top-[18px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
          </div>

          {/* Agent landing page — full mock */}
          <div style={{ background: '#020617' }}>

            {/* Header — centered logo only, matching the real template */}
            <div className="relative" style={{ background: '#0f172a' }}>
              <div className="px-5 py-3.5 flex items-center justify-center border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">SR</span>
                  </div>
                  <span className="text-white text-sm font-bold">Smith Real Estate</span>
                </div>
              </div>

              {/* Annotation 1 — header */}
              <div className="hidden md:block absolute left-[-220px] top-[4px] w-[200px]">
                <AnnotationCard number="1" title="Your logo and brand colours" desc="Upload your logo, set header and page colour. 100% yours." side="left" />
              </div>
              <div className="hidden md:block absolute left-[10px] top-[44px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
            </div>

            {/* Hero */}
            <div className="px-6 pt-14 pb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-3 py-1.5 rounded-full text-[10px] mb-6">
                <Star className="h-3 w-3 text-emerald-400" fill="currentColor" strokeWidth={0} />
                Powered by PropTrack data
              </div>
              <h2 className="text-white text-2xl font-bold mb-2 leading-tight tracking-tight">
                Discover Your Home&apos;s<br />Current Market Value
              </h2>
              <p className="text-white/50 text-sm mb-8">
                Get a free, no-obligation property report in 30 seconds.
              </p>

              {/* Address search */}
              <div className="relative">
                <div className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 mb-3 shadow-lg">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-slate-400 text-sm">Enter your property address...</span>
                </div>

                {/* Annotation 2 — address search */}
                <div className="hidden md:block absolute right-[-220px] top-[-8px] w-[200px]">
                  <AnnotationCard number="2" title="PropTrack address search" desc="Australia's most trusted property data, live in the search." side="right" />
                </div>
                <div className="hidden md:block absolute right-[-10px] top-[16px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />

                <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                  Get My Free Property Report
                </button>
              </div>

              <p className="text-white/20 text-xs mt-5">Prepared by Sarah Smith · Smith Real Estate</p>
            </div>

            {/* Lead capture form (shown after address) */}
            <div className="mx-6 mb-6 bg-white/5 border border-white/10 rounded-xl p-5 relative">
              <p className="text-white text-sm font-semibold mb-1">Almost there. Where should we send it?</p>
              <p className="text-white/40 text-xs mb-4">Your report will be emailed to you instantly.</p>
              <div className="space-y-2.5">
                {['Full name', 'Email address', 'Phone number'].map(placeholder => (
                  <div key={placeholder} className="bg-white/10 border border-white/10 rounded-lg px-3 py-2.5">
                    <span className="text-white/30 text-xs">{placeholder}</span>
                  </div>
                ))}
                <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2.5">
                  <span className="text-white/30 text-xs">How soon are you looking to sell? (optional)</span>
                </div>
              </div>
              <button className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-lg text-sm mt-3">
                Send My Report
              </button>

              {/* Annotation 3 — lead form */}
              <div className="hidden md:block absolute left-[-220px] top-[20px] w-[200px]">
                <AnnotationCard number="3" title="Lead capture built in" desc="Collected before the report is shown. Lands straight in your dashboard." side="left" />
              </div>
              <div className="hidden md:block absolute left-[-10px] top-[48px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
            </div>

            {/* PropTrack badge */}
            <div className="pb-6 flex justify-center">
              <div className="border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-white/30 text-[10px]">Powered by PropTrack</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile annotations below */}
        <div className="md:hidden mt-8 grid grid-cols-2 gap-3">
          {[
            { number: '1', title: 'Your logo and brand colours', desc: 'Upload your logo, set header and page colour.' },
            { number: '2', title: 'PropTrack address search', desc: "Australia's most trusted property data." },
            { number: '3', title: 'Lead capture built in', desc: 'Lands straight in your dashboard.' },
            { number: '4', title: 'Your unique URL', desc: 'Share in ads, emails, and letterbox drops.' },
          ].map(a => (
            <div key={a.number} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center mb-3">
                <span className="text-zinc-950 text-xs font-bold">{a.number}</span>
              </div>
              <p className="text-white text-xs font-semibold mb-1">{a.title}</p>
              <p className="text-zinc-500 text-[11px]">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-zinc-800 py-14 text-center px-4">
        <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Ready to set up your page?</h2>
        <p className="text-zinc-400 text-sm mb-8">Be live in under 10 minutes. No developers needed.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-8 h-12 rounded-lg transition-colors text-sm"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-medium px-6 h-12 rounded-lg transition-colors text-sm"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-zinc-600 text-xs mt-4">30-day free trial · No credit card required</p>
      </div>
    </div>
  )
}

function AnnotationCard({ number, title, desc, side }: { number: string; title: string; desc: string; side: 'left' | 'right' }) {
  return (
    <div className={`relative bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl ${side === 'right' ? 'text-left' : 'text-left'}`}>
      {/* Connector line */}
      <div className={`absolute top-[14px] ${side === 'right' ? 'left-[-28px] border-r-0 border-l border-b rounded-bl-lg' : 'right-[-28px] border-l-0 border-r border-b rounded-br-lg'} w-7 h-4 border-zinc-600`} />
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-zinc-950 text-[9px] font-black">{number}</span>
        </div>
        <div>
          <p className="text-white text-[11px] font-semibold leading-tight mb-1">{title}</p>
          <p className="text-zinc-500 text-[10px] leading-snug">{desc}</p>
        </div>
      </div>
    </div>
  )
}
