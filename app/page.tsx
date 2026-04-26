import Link from 'next/link'
import { Database, BarChart3, Palette, ArrowRight, Shield, Zap, Database as Db, CheckCircle } from 'lucide-react'
import { LeadAgentLogo } from '@/components/ui/LeadAgentLogo'
import { MarketingHeader } from '@/components/marketing/marketing-header'

export const metadata = {
  title: 'Property Appraisals for Real Estate Agents',
  description: 'Generate professional property appraisals instantly using PropTrack data. Capture high-intent leads with a branded landing page. Start your free trial today.',
  openGraph: {
    title: 'InstantAppraisal — Property Appraisals for Real Estate Agents',
    description: 'Generate professional property appraisals instantly using PropTrack data. Capture high-intent leads with a branded landing page.',
  },
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full animate-bg-orb-1"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full animate-bg-orb-2"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-bg-orb-3"
        style={{ background: 'radial-gradient(circle, rgba(168,162,158,0.03) 0%, transparent 60%)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

const FEATURES = [
  {
    icon: Database,
    title: 'PropTrack Data Intelligence',
    description: 'Verified property data from PropTrack. Real-time valuations that build instant trust with prospects.',
    highlight: 'Real-time data',
  },
  {
    icon: BarChart3,
    title: 'Multi-Channel Attribution',
    description: 'Track Facebook, Google, and letterbox drops. Know exactly which campaigns drive results.',
    highlight: 'Full visibility',
  },
  {
    icon: Palette,
    title: 'White-Labeled Branding',
    description: 'Your brand, our engine. Fully customizable landing pages that look 100% yours.',
    highlight: 'Your identity',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <MarketingHeader />

      {/* Hero */}
      <section id="how-it-works" className="relative overflow-hidden min-h-screen flex items-center">
        <AnimatedBackground />

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center landing-fade-in-up">
            <div
              className="inline-flex items-center gap-2 bg-white/5 text-zinc-400 px-4 py-2 rounded text-xs font-medium mb-8 border border-white/10 backdrop-blur-sm landing-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <Shield className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
              Integrated with data from PropTrack
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 tracking-tight leading-tight landing-fade-in-up"
              style={{ animationDelay: '0.15s' }}
            >
              The Data-Driven Edge for{' '}
              <span className="text-emerald-400">Elite Agents</span>
            </h1>

            <p
              className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed landing-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              Generate high-intent leads with real-time PropTrack intelligence.
              Start your 30-Day Free Trial today.
            </p>

            <div className="flex flex-col items-center gap-4 landing-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-10 h-14 text-base rounded transition-colors"
              >
                Start 30-Day Free Trial
                <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2} />
              </Link>
              <p className="text-zinc-500 text-sm">30-day free trial, cancel anytime.</p>
              <Link href="/auth/login" className="text-zinc-500 hover:text-white text-sm transition-colors">
                Already have an account?{' '}
                <span className="font-medium text-zinc-400">Go to Dashboard</span>
              </Link>
            </div>

            <div
              className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 landing-fade-in-up"
              style={{ animationDelay: '0.35s' }}
            >
              {[
                { icon: Db, text: 'Powered by PropTrack data' },
                { icon: Palette, text: 'White-labelled to your brand' },
                { icon: Zap, text: 'Reports generated in seconds' },
              ].map((item) => (
                <span key={item.text} className="flex flex-col items-center gap-2 text-zinc-500 text-sm text-center">
                  <item.icon className="h-4 w-4 text-emerald-500/70" strokeWidth={1.5} />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 landing-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="w-5 h-8 rounded-full border border-zinc-700 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-zinc-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-zinc-900/50 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              The Complete Lead Intelligence Platform
            </h2>
            <p className="text-zinc-400 text-base max-w-lg mx-auto">
              Three powerful pillars that give you an unfair advantage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-zinc-900/80 backdrop-blur-sm rounded border border-zinc-800 p-8 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                <div className="relative">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded flex items-center justify-center mb-6 border border-emerald-500/20">
                    <feature.icon className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                    {feature.highlight}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-2 mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Pricing */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-zinc-900 to-zinc-950 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded text-xs font-medium mb-6 border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
              Limited Time Offer
            </div>

            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              Ready to Outperform Your Competition?
            </h2>
            <p className="text-zinc-400 text-base mb-8 max-w-xl mx-auto">
              Join the elite agents already leveraging PropTrack intelligence to close more deals.
            </p>

            <div className="flex flex-col items-center gap-6">
              <Link
                href="/auth/signup"
                className="inline-flex items-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-10 h-14 text-base rounded transition-colors"
              >
                Start 30-Day Free Trial
                <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2} />
              </Link>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-zinc-500 text-sm">
                {['30-day free trial', 'Cancel anytime', 'Full access'].map((item, i) => (
                  <span key={item} className="flex items-center gap-4 text-zinc-500 text-sm">
                    {i > 0 && <span className="hidden sm:block text-zinc-700">•</span>}
                    <CheckCircle className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <LeadAgentLogo height={28} dark />
            <p className="text-zinc-600 text-xs">
              © {new Date().getFullYear()} Instant Appraisal. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
