import Link from 'next/link'
import {
  Database, BarChart3, Palette, ArrowRight, Shield, Zap, Database as Db,
  CheckCircle, TrendingUp, Home, Clock, Users, LayoutGrid, DollarSign,
  GraduationCap, ChevronDown, Star, MousePointerClick, FileText, Bell,
  Webhook, Globe, Lock,
} from 'lucide-react'
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

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set up your branded page',
    description: 'Upload your logo, set your brand colours, and get a shareable link in minutes. No developers needed.',
    icon: Palette,
  },
  {
    step: '02',
    title: 'Share it everywhere',
    description: 'Drop the link in Facebook ads, Google campaigns, letterbox drops, or your email signature. One link, all channels tracked.',
    icon: Globe,
  },
  {
    step: '03',
    title: 'Homeowner gets their report',
    description: 'They search their address, enter their contact details, and receive a real PropTrack report instantly — all on your branded page.',
    icon: FileText,
  },
  {
    step: '04',
    title: 'You get the lead',
    description: 'Their details land in your dashboard immediately. You get a notification, they get a follow-up email from you — automatically.',
    icon: Bell,
  },
]

const FEATURES = [
  {
    icon: Database,
    title: 'Real PropTrack Data',
    description: "Every report is powered by PropTrack — Australia's most trusted property data provider. Homeowners get a real estimated value range, not a guess, which means they trust you before you've even picked up the phone.",
    highlight: 'Powered by PropTrack',
  },
  {
    icon: Palette,
    title: 'Fully White-Labelled',
    description: "Your logo, your colours, your URL slug. The page looks 100% like yours. Homeowners associate the experience with your brand — not a third-party tool.",
    highlight: 'Your brand',
  },
  {
    icon: BarChart3,
    title: 'Multi-Channel Attribution',
    description: 'Track every lead back to its source — Facebook, Google, letterbox drop, or email. Know your cost per lead by channel and double down on what works.',
    highlight: 'Full attribution',
  },
  {
    icon: Bell,
    title: 'Instant Lead Notifications',
    description: "The moment a homeowner submits their details, you're notified. No delays, no batch reports. First-mover advantage on every enquiry.",
    highlight: 'Real-time alerts',
  },
  {
    icon: Webhook,
    title: 'LeadConnector / CRM Integration',
    description: 'Connect your GoHighLevel or LeadConnector account with a single webhook URL. Leads flow straight into your pipeline without any manual import.',
    highlight: 'Auto-sync',
  },
  {
    icon: Lock,
    title: 'Lead Data Ownership',
    description: 'Every lead captured on your page belongs to you. View, filter, export, and follow up — all from your private dashboard.',
    highlight: 'Your data',
  },
]

const REPORT_SECTIONS = [
  { icon: TrendingUp, label: 'Estimated Value Range', desc: 'Instant PropTrack valuation with confidence rating' },
  { icon: Home, label: 'Property Details', desc: 'Beds, baths, land size, property type & more' },
  { icon: Clock, label: 'Property History', desc: 'Full sold & leased price timeline' },
  { icon: BarChart3, label: 'Comparable Sales', desc: 'Recent nearby sales with addresses & prices' },
  { icon: DollarSign, label: 'Market Insights', desc: 'Suburb median price & days on market' },
  { icon: LayoutGrid, label: 'Price Guide by Bedrooms', desc: 'How bedroom count affects value in the suburb' },
  { icon: Users, label: 'Potential Buyer Demand', desc: 'Live buyer enquiry data from realestate.com.au' },
  { icon: GraduationCap, label: 'Nearby Schools', desc: 'Primary & secondary schools within the catchment' },
]

const PRICING_PLANS = [
  {
    name: 'Launch',
    price: 47,
    description: 'Perfect for individual agents getting started with digital lead generation.',
    features: [
      '1 branded landing page',
      'PropTrack property reports',
      'Lead dashboard & notifications',
      'Vendor confirmation emails',
      'UTM source tracking',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 97,
    description: 'For agents serious about scaling their appraisal pipeline.',
    features: [
      'Everything in Launch',
      'Multi-channel attribution',
      'Facebook Pixel & GTM integration',
      'LeadConnector / CRM webhook',
      'Pipeline status tracking',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Elite',
    price: 247,
    description: 'For top-performing agents and teams who want the full suite.',
    features: [
      'Everything in Pro',
      'Multiple landing pages',
      'Agency branding',
      'Advanced analytics',
      'Dedicated onboarding',
      'Phone support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
]

const FAQS = [
  {
    q: 'What is InstantAppraisal?',
    a: 'InstantAppraisal is a lead generation tool for licensed real estate agents. It gives you a branded landing page where homeowners can enter their address and instantly receive a real PropTrack property report — in exchange for their contact details.',
  },
  {
    q: 'Where does the property data come from?',
    a: "All property reports are powered by PropTrack, Australia's leading property data provider. Data includes estimated value ranges, comparable sales, market insights, and more — sourced under licence from state and territory Valuer General offices.",
  },
  {
    q: 'Does the homeowner know they are submitting a lead?',
    a: 'Yes. Before receiving their report, homeowners enter their name, email, and phone number. They understand that by doing so, the agent will be in touch. There is no hidden data capture.',
  },
  {
    q: 'Can I use it for Facebook and Google ads?',
    a: 'Absolutely — that is the most common use case. Your branded landing page URL is the destination for your ads. You can connect your Facebook Pixel and Google Tag Manager ID directly in your settings, and track source attribution per lead using UTM parameters.',
  },
  {
    q: 'Do leads sync to my CRM automatically?',
    a: 'Yes. If you use GoHighLevel or LeadConnector, paste your webhook URL into your settings and all new leads will be pushed to your pipeline automatically.',
  },
  {
    q: 'What happens after the free trial?',
    a: "Your 30-day trial gives you full access to every feature on your chosen plan. After 30 days, your subscription begins automatically. You can cancel anytime before that and you won't be charged.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-zinc-800 py-5">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-sm font-medium text-white pr-6">{q}</span>
        <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 transition-transform group-open:rotate-180" strokeWidth={2} />
      </summary>
      <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{a}</p>
    </details>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section id="hero" className="relative overflow-hidden min-h-screen flex items-center">
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
              Turn homeowners into{' '}
              <span className="text-emerald-400">appraisal leads</span>
              {' '}on autopilot
            </h1>

            <p
              className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed landing-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              Give homeowners a free PropTrack property report. Capture their contact details automatically. Get high-intent listing leads — without cold calling.
            </p>

            <div className="flex flex-col items-center gap-4 landing-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <Link
                href="/auth/signup"
                className="inline-flex items-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-10 h-14 text-base rounded transition-colors"
              >
                Start 30-Day Free Trial
                <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2} />
              </Link>
              <p className="text-zinc-500 text-sm">30-day free trial · No credit card required · Cancel anytime</p>
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

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-zinc-950 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              Live in minutes. Leads from day one.
            </h2>
            <p className="text-zinc-400 text-base max-w-lg mx-auto">
              No developers, no complex setup. Your branded appraisal page is live in under 10 minutes.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%_-_12px)] w-full h-px bg-gradient-to-r from-zinc-700 to-transparent z-10" />
                )}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-emerald-400 font-mono">{step.step}</span>
                    <div className="w-8 h-8 bg-emerald-500/10 rounded flex items-center justify-center border border-emerald-500/20">
                      <step.icon className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/demo" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
              <MousePointerClick className="h-4 w-4" strokeWidth={1.5} />
              See a live demo page
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-zinc-900/50 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-zinc-400 text-base max-w-lg mx-auto">
              Built specifically for Australian real estate agents who want more appraisal leads without more cold calling.
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
                  <h3 className="text-base font-semibold text-white mt-2 mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's in the report ── */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">The Report</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-5 tracking-tight leading-tight">
                  A report homeowners actually want to read
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Homeowners receive a comprehensive PropTrack property report instantly — covering everything from estimated value to comparable sales and local buyer demand. It's professional, it's data-driven, and it has your name on it.
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  When you follow up, they already trust you. You're the agent who gave them something valuable before they even called.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {REPORT_SECTIONS.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="bg-zinc-900/60 border border-zinc-800 rounded p-4 hover:border-zinc-700 transition-colors"
                  >
                    <Icon className="h-4 w-4 mb-2 text-emerald-400" strokeWidth={1.5} />
                    <p className="text-xs font-medium text-white mb-1">{label}</p>
                    <p className="text-[11px] leading-relaxed text-zinc-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-zinc-900/50 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400 text-base max-w-md mx-auto">
              Start with a 30-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded border p-8 flex flex-col ${
                  plan.highlighted
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">
                      <Star className="h-3 w-3" fill="currentColor" strokeWidth={0} />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm font-semibold text-white mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-zinc-500 text-sm mb-1">/month</span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-zinc-300 text-xs">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={`inline-flex items-center justify-center h-10 rounded text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-zinc-500 text-xs mt-8">
            All plans include a 30-day free trial. Cancel anytime before your trial ends and you won't be charged.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="text-3xl font-semibold text-white tracking-tight">Common questions</h2>
            </div>
            <div>
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gradient-to-b from-zinc-900 to-zinc-950 border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded text-xs font-medium mb-6 border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
              30-Day Free Trial
            </div>

            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
              Ready to start generating appraisal leads?
            </h2>
            <p className="text-zinc-400 text-base mb-10 max-w-xl mx-auto">
              Join agents across Australia using InstantAppraisal to capture high-intent leads with real PropTrack data.
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
                {['30-day free trial', 'No credit card required', 'Cancel anytime'].map((item, i) => (
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

      {/* ── Footer ── */}
      <footer className="bg-zinc-950 border-t border-zinc-800/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <LeadAgentLogo height={28} dark />
            <p className="text-zinc-600 text-xs">
              © 2022–{new Date().getFullYear()} Instant Appraisal. All rights reserved.
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
