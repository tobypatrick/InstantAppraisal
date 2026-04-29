import Link from 'next/link'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/marketing-header'

export const metadata = {
  title: 'Live Demo | InstantAppraisal',
  description: 'See what your branded property appraisal page looks like to homeowners.',
}

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

      {/* Annotated mockup */}
      {/*
        Layout: the outer div is the positioning context for all annotations.
        Annotations are NOT inside the overflow-hidden browser chrome — they're
        siblings of it, positioned absolutely relative to this outer wrapper.
        This prevents overflow-hidden from clipping them.
      */}
      <div className="relative max-w-xl mx-auto px-4 pb-16">

        {/* ── Desktop annotation cards (hidden on mobile) ── */}

        {/* Annotation 4 — URL bar (right) */}
        <div className="hidden md:block absolute top-[6px] right-[-228px] w-[200px] z-20">
          <AnnotationCard number="4" title="Your unique URL" desc="Share my.instantappraisal.co/your-name in ads, emails, and letterbox drops." side="right" />
        </div>

        {/* Annotation 1 — Agent header (left) */}
        <div className="hidden md:block absolute top-[54px] left-[-228px] w-[200px] z-20">
          <AnnotationCard number="1" title="Your logo and brand colours" desc="Upload your logo and set your brand colours. Looks 100% like yours." side="left" />
        </div>

        {/* Annotation 2 — Address search (right) */}
        <div className="hidden md:block absolute top-[330px] right-[-228px] w-[200px] z-20">
          <AnnotationCard number="2" title="Instant PropTrack address search" desc="Homeowners search their address using Australia's most trusted property data." side="right" />
        </div>

        {/* Annotation 3 — Lead form (left) */}
        <div className="hidden md:block absolute top-[490px] left-[-228px] w-[200px] z-20">
          <AnnotationCard number="3" title="Lead capture built in" desc="Name, email, and phone collected before the report is shown. Goes straight to your dashboard." side="left" />
        </div>

        {/* ── Dot indicators on the browser chrome ── */}
        <div className="hidden md:block absolute top-[20px] right-[88px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 z-20" />
        <div className="hidden md:block absolute top-[72px] left-[14px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 z-20" />
        <div className="hidden md:block absolute top-[354px] right-[14px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 z-20" />
        <div className="hidden md:block absolute top-[516px] left-[14px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 z-20" />

        {/* ── Browser chrome ── */}
        <div className="rounded-2xl overflow-hidden border border-zinc-700 shadow-[0_0_80px_rgba(0,0,0,0.6)]">

          {/* URL bar */}
          <div className="bg-zinc-800 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="flex-1 bg-zinc-700/60 rounded-md px-3 py-1.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-300 font-mono">my.instantappraisal.co/sarah-smith</span>
            </div>
          </div>

          {/* Agent page content */}
          <div style={{ background: '#020617' }}>

            {/* Centered header — logo only, matches real TemplateHeader */}
            <div style={{ background: '#0f172a' }}>
              <div className="px-5 py-3.5 flex items-center justify-center border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">SR</span>
                  </div>
                  <span className="text-white text-sm font-bold">Smith Real Estate</span>
                </div>
              </div>
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
              <div className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3 mb-3 shadow-lg">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" strokeWidth={1.5} />
                <span className="text-slate-400 text-sm">Enter your property address...</span>
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                Get My Free Property Report
              </button>
              <p className="text-white/20 text-xs mt-5">Prepared by Sarah Smith · Smith Real Estate</p>
            </div>

            {/* Lead capture form */}
            <div className="mx-6 mb-6 bg-white/5 border border-white/10 rounded-xl p-5">
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

        {/* Mobile annotation cards */}
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
    <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl">
      {/* Connector line pointing toward the browser */}
      <div className={`absolute top-[14px] ${
        side === 'right'
          ? 'left-[-28px] border-l border-b rounded-bl-lg'
          : 'right-[-28px] border-r border-b rounded-br-lg'
      } w-7 h-4 border-zinc-600`} />
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
