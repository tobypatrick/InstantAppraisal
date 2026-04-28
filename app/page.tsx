import Link from 'next/link'
import {
  Database, BarChart3, Palette, ArrowRight, Shield, Zap, Database as Db,
  CheckCircle, TrendingUp, Home, Clock, Users, LayoutGrid, DollarSign,
  GraduationCap, ChevronDown, Star, MousePointerClick, FileText, Bell,
  Webhook, Globe, Lock, Mail, Filter, Tag, Download, Eye,
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
    description: 'They search their address, enter their contact details, and receive a real PropTrack report instantly on your branded page.',
    icon: FileText,
  },
  {
    step: '04',
    title: 'You get the lead',
    description: 'Their details land in your dashboard immediately. You get a notification, they get a follow-up email from you automatically.',
    icon: Bell,
  },
]

const FEATURES = [
  {
    icon: Database,
    title: 'Real PropTrack Data',
    description: "Every report is powered by PropTrack, Australia's most trusted property data provider. Homeowners get a real estimated value range, not a guess.",
    highlight: 'Powered by PropTrack',
    accent: 'emerald',
  },
  {
    icon: Palette,
    title: 'Fully White-Labelled',
    description: "Your logo, your colours, your URL slug. The page looks 100% like yours. Homeowners associate the experience with your brand, not a third-party tool.",
    highlight: 'Your brand',
    accent: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Multi-Channel Attribution',
    description: 'Track every lead back to its source: Facebook, Google, letterbox drop, or email. Know your cost per lead by channel and double down on what works.',
    highlight: 'Full attribution',
    accent: 'violet',
  },
  {
    icon: Bell,
    title: 'Instant Lead Notifications',
    description: "The moment a homeowner submits their details, you're notified. No delays, no batch reports. First-mover advantage on every enquiry.",
    highlight: 'Real-time alerts',
    accent: 'amber',
  },
  {
    icon: Webhook,
    title: 'CRM Integration',
    description: 'Connect your GoHighLevel or LeadConnector account with a single webhook URL. Leads flow straight into your pipeline without any manual import.',
    highlight: 'Auto-sync',
    accent: 'rose',
  },
  {
    icon: Lock,
    title: 'Lead Data Ownership',
    description: 'Every lead captured on your page belongs to you. View, filter, export, and follow up from your private dashboard.',
    highlight: 'Your data',
    accent: 'emerald',
  },
]

const DASHBOARD_FEATURES = [
  { icon: Eye, label: 'Full lead history', desc: 'Every enquiry with name, email, phone, address, and report status' },
  { icon: Filter, label: 'Filter & search', desc: 'Filter by source, date range, report status, or pipeline stage' },
  { icon: Tag, label: 'Pipeline status', desc: 'Mark leads as Contacted, Meeting Booked, Listed, or Lost' },
  { icon: BarChart3, label: 'Source analytics', desc: 'See which campaigns and channels are driving the most leads' },
  { icon: Bell, label: 'Real-time updates', desc: 'New leads appear the moment they submit, no refresh needed' },
  { icon: Download, label: 'Export leads', desc: 'Download your lead list as a CSV at any time' },
]

const REPORT_SECTIONS = [
  { icon: TrendingUp, label: 'Estimated Value Range', desc: 'Instant PropTrack valuation with confidence rating' },
  { icon: Home, label: 'Property Details', desc: 'Beds, baths, land size, property type and more' },
  { icon: Clock, label: 'Property History', desc: 'Full sold and leased price timeline' },
  { icon: BarChart3, label: 'Comparable Sales', desc: 'Recent nearby sales with addresses and prices' },
  { icon: DollarSign, label: 'Market Insights', desc: 'Suburb median price and days on market' },
  { icon: LayoutGrid, label: 'Price Guide by Bedrooms', desc: 'How bedroom count affects value in the suburb' },
  { icon: Users, label: 'Potential Buyer Demand', desc: 'Live buyer enquiry data from realestate.com.au' },
  { icon: GraduationCap, label: 'Nearby Schools', desc: 'Primary and secondary schools within the catchment' },
]

const PRICING_PLANS = [
  {
    name: 'Launch',
    price: 47,
    description: 'Perfect for individual agents getting started with digital lead generation.',
    features: [
      '1 branded landing page',
      'PropTrack property reports',
      'Lead dashboard and notifications',
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
      'Facebook Pixel and GTM integration',
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
    a: 'InstantAppraisal is a lead generation tool for licensed real estate agents. It gives you a branded landing page where homeowners can enter their address and instantly receive a real PropTrack property report in exchange for their contact details.',
  },
  {
    q: 'Where does the property data come from?',
    a: "All property reports are powered by PropTrack, Australia's leading property data provider. Data includes estimated value ranges, comparable sales, market insights, and more, sourced under licence from state and territory Valuer General offices.",
  },
  {
    q: 'Does the homeowner know they are submitting a lead?',
    a: 'Yes. Before receiving their report, homeowners enter their name, email, and phone number. They understand that by doing so, the agent will be in touch. There is no hidden data capture.',
  },
  {
    q: 'Can I use it for Facebook and Google ads?',
    a: 'Absolutely. That is the most common use case. Your branded landing page URL is the destination for your ads. You can connect your Facebook Pixel and Google Tag Manager ID directly in your settings, and track source attribution per lead using UTM parameters.',
  },
  {
    q: 'Do leads sync to my CRM automatically?',
    a: 'Yes. If you use GoHighLevel or LeadConnector, paste your webhook URL into your settings and all new leads will be pushed to your pipeline automatically.',
  },
  {
    q: 'What happens after the free trial?',
    a: "Your 30-day trial gives you full access to every feature on your chosen plan. After 30 days, your subscription begins automatically. You can cancel anytime before that and you will not be charged.",
  },
]

const ACCENT_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', icon: 'text-violet-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-400' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: 'text-rose-400' },
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-zinc-200 py-5">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="text-sm font-medium text-zinc-900 pr-6">{q}</span>
        <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 transition-transform group-open:rotate-180" strokeWidth={2} />
      </summary>
      <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{a}</p>
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
              Give homeowners a free PropTrack property report. Capture their contact details automatically. Get high-intent listing leads without the cold calls.
            </p>

            <div className="flex flex-col items-center gap-4 landing-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-10 h-14 text-base rounded transition-colors"
                >
                  Start 30-Day Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2} />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 h-14 text-base rounded transition-colors"
                >
                  <MousePointerClick className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                  See a live demo
                </Link>
              </div>
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

      {/* ── How It Works — WHITE section for contrast ── */}
      <section id="how-it-works" className="py-28 bg-white border-t border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <p className="text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-4 tracking-tight">
              Live in minutes. Leads from day one.
            </h2>
            <p className="text-zinc-500 text-base max-w-lg mx-auto">
              No developers, no complex setup. Your branded appraisal page is live in under 10 minutes.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-10">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%_-_8px)] w-full h-px bg-zinc-200 z-10" />
                )}
                <div className="text-7xl font-black text-zinc-100 leading-none mb-4 select-none">{step.step}</div>
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 border border-emerald-100">
                  <step.icon className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-6 h-11 rounded transition-colors"
            >
              <MousePointerClick className="h-4 w-4" strokeWidth={1.5} />
              See the homeowner experience
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features — coloured accent cards ── */}
      <section id="features" className="py-28 bg-zinc-950 border-t border-zinc-800/50">
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

          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((feature) => {
              const colors = ACCENT_COLORS[feature.accent] ?? ACCENT_COLORS.emerald
              return (
                <div
                  key={feature.title}
                  className="group relative bg-zinc-900 rounded-xl border border-zinc-800 p-7 hover:border-zinc-700 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${colors.bg}`} />
                  <div className="relative">
                    <div className={`w-11 h-11 ${colors.bg} rounded-lg flex items-center justify-center mb-5 border ${colors.border}`}>
                      <feature.icon className={`h-5 w-5 ${colors.icon}`} strokeWidth={1.5} />
                    </div>
                    <span className={`${colors.text} text-[10px] font-semibold uppercase tracking-wider`}>
                      {feature.highlight}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1.5 mb-2.5">{feature.title}</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Your Dashboard — dark navy tint, mock UI ── */}
      <section className="py-28 bg-slate-950 border-t border-slate-800/80">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">Your Dashboard</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-5 tracking-tight leading-tight">
                  Every lead in one place. Always up to date.
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Your private dashboard gives you a real-time view of every homeowner who has requested a report: their name, contact details, property address, report status, and the channel that brought them in.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Filter by source, search by address, and track each lead through your pipeline from first contact to signed listing. No more spreadsheets.
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-6 h-11 rounded transition-colors"
                >
                  Start your free trial
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>

              {/* Mock dashboard UI */}
              <div className="rounded-xl border border-slate-700/60 overflow-hidden shadow-2xl shadow-black/40">
                {/* Dashboard header bar */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-slate-400 text-xs font-medium">Leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-800 rounded px-2 py-1 text-[10px] text-slate-500">Filter</div>
                    <div className="bg-blue-500/20 rounded px-2 py-1 text-[10px] text-blue-400">Export CSV</div>
                  </div>
                </div>
                {/* Column headers */}
                <div className="bg-slate-900/80 border-b border-slate-800/60 px-4 py-2 grid grid-cols-4 gap-2">
                  {['Contact', 'Address', 'Source', 'Status'].map(h => (
                    <span key={h} className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{h}</span>
                  ))}
                </div>
                {/* Mock rows */}
                {[
                  { name: 'James W.', address: '14 Ocean Dr, Manly', source: 'Facebook', status: 'Meeting', color: 'text-violet-400 bg-violet-500/10' },
                  { name: 'Sarah K.', address: '3 Palm Ave, Bondi', source: 'Google', status: 'Contacted', color: 'text-blue-400 bg-blue-500/10' },
                  { name: 'Mark T.', address: '88 Ridge Rd, Dee Why', source: 'Letterbox', status: 'New', color: 'text-emerald-400 bg-emerald-500/10' },
                  { name: 'Lisa M.', address: '22 Bay St, Mosman', source: 'Facebook', status: 'Listed', color: 'text-amber-400 bg-amber-500/10' },
                  { name: 'Chris P.', address: '5 Hill Cres, Neutral Bay', source: 'Google', status: 'New', color: 'text-emerald-400 bg-emerald-500/10' },
                ].map((row) => (
                  <div key={row.name} className="bg-slate-950 border-b border-slate-800/40 px-4 py-3 grid grid-cols-4 gap-2 items-center hover:bg-slate-900/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-[8px] text-slate-400 font-semibold">{row.name[0]}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium truncate">{row.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate">{row.address}</span>
                    <span className="text-[10px] text-slate-500">{row.source}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded w-fit ${row.color}`}>{row.status}</span>
                  </div>
                ))}
                <div className="bg-slate-900/50 px-4 py-2 text-center">
                  <span className="text-[10px] text-slate-600">47 total leads this month</span>
                </div>
              </div>
            </div>

            {/* Feature tiles below */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-12">
              {DASHBOARD_FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-4">
                  <Icon className="h-4 w-4 mb-2 text-blue-400" strokeWidth={1.5} />
                  <p className="text-xs font-medium text-white mb-1">{label}</p>
                  <p className="text-[11px] leading-relaxed text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Automated Emails — warm dark section ── */}
      <section className="py-28 border-t border-zinc-800/50" style={{ background: 'linear-gradient(135deg, #18181b 0%, #1c1917 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">Automated Emails</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
                Follow-up starts before you lift a finger
              </h2>
              <p className="text-zinc-400 text-base max-w-lg mx-auto">
                Two emails fire automatically the moment a lead is captured: one to you, one to the homeowner.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Agent notification — email mock */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="border-b border-zinc-800 px-5 py-3 flex items-center gap-3 bg-zinc-900">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <Bell className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Sent to you</p>
                    <h3 className="text-xs font-semibold text-white">New Lead Notification</h3>
                  </div>
                </div>
                {/* Mock email */}
                <div className="p-5 bg-white/[0.02]">
                  <div className="bg-zinc-900 rounded-lg border border-zinc-700/50 p-4 text-[10px] space-y-1 mb-5 font-mono">
                    <p><span className="text-zinc-500">From:</span> <span className="text-zinc-300">noreply@instantappraisal.co</span></p>
                    <p><span className="text-zinc-500">To:</span> <span className="text-zinc-300">you@youragency.com.au</span></p>
                    <p><span className="text-zinc-500">Subject:</span> <span className="text-white font-semibold">New lead: James Wilson, 14 Ocean Dr Manly</span></p>
                  </div>
                  <ul className="space-y-2">
                    {["Contact name and phone number", "Property address searched", "Lead source (Facebook, Google, etc.)", "Link to their PropTrack report", "Direct link to your dashboard"].map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" strokeWidth={1.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Vendor confirmation — email mock */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="border-b border-zinc-800 px-5 py-3 flex items-center gap-3 bg-zinc-900">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                    <Mail className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Sent to the homeowner</p>
                    <h3 className="text-xs font-semibold text-white">Vendor Confirmation</h3>
                  </div>
                </div>
                <div className="p-5 bg-white/[0.02]">
                  <div className="bg-zinc-900 rounded-lg border border-zinc-700/50 p-4 text-[10px] space-y-1 mb-5 font-mono">
                    <p><span className="text-zinc-500">From:</span> <span className="text-zinc-300">Sarah Smith via InstantAppraisal</span></p>
                    <p><span className="text-zinc-500">To:</span> <span className="text-zinc-300">james.wilson@email.com</span></p>
                    <p><span className="text-zinc-500">Subject:</span> <span className="text-white font-semibold">Your Instant Property Appraisal: 14 Ocean Dr</span></p>
                  </div>
                  <ul className="space-y-2">
                    {["Personalised with your name and agency", "Includes their property address", "Link to view their full PropTrack report", "Your phone and email for direct contact", "Reply-to is your own email address"].map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-zinc-400">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" strokeWidth={1.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What's in the report — emerald tinted dark ── */}
      <section className="py-28 border-t border-emerald-900/30" style={{ background: 'linear-gradient(135deg, #052e16 0%, #18181b 40%)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">The Report</p>
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-5 tracking-tight leading-tight">
                  A report homeowners actually want to read
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Homeowners receive a comprehensive PropTrack property report instantly, covering everything from estimated value to comparable sales and live buyer demand. It's professional, data-driven, and has your name on it.
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  When you follow up, they already trust you. You're the agent who gave them something valuable before they even called.
                </p>
                <p className="text-emerald-900/80 text-xs border border-emerald-900/40 bg-emerald-950/50 rounded-lg px-3 py-2 text-emerald-500/70">
                  Reports are sourced under licence from PropTrack Pty Ltd (ABN 43 127 386 298) using data from state and territory Valuer General offices.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {REPORT_SECTIONS.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="bg-emerald-950/30 border border-emerald-900/30 rounded-lg p-4 hover:border-emerald-800/50 hover:bg-emerald-950/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 mb-2 text-emerald-400" strokeWidth={1.5} />
                    <p className="text-xs font-medium text-white mb-1">{label}</p>
                    <p className="text-[11px] leading-relaxed text-emerald-700/80">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo CTA banner ── */}
      <section className="py-14 bg-emerald-500">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-zinc-950 font-bold text-xl mb-1">Want to see the homeowner experience?</p>
              <p className="text-emerald-900 text-sm">Walk through the full flow: branded page, address search, report preview, and lead capture.</p>
            </div>
            <Link
              href="/demo"
              className="shrink-0 inline-flex items-center gap-2 bg-zinc-950 text-white font-semibold px-8 h-12 rounded hover:bg-zinc-800 transition-colors text-sm"
            >
              <MousePointerClick className="h-4 w-4" strokeWidth={2} />
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing — light background ── */}
      <section id="pricing" className="py-28 bg-zinc-50 border-t border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-500 text-base max-w-md mx-auto">
              Start with a 30-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? 'bg-zinc-900 border-zinc-700 shadow-2xl shadow-zinc-900/30'
                    : 'bg-white border-zinc-200 shadow-sm'
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
                  <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? 'text-white' : 'text-zinc-900'}`}>{plan.name}</p>
                  <div className="flex items-end gap-1 mb-3">
                    <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-zinc-900'}`}>${plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlighted ? 'text-zinc-500' : 'text-zinc-400'}`}>/month</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${plan.highlighted ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.description}</p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className={`text-xs ${plan.highlighted ? 'text-zinc-300' : 'text-zinc-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={`inline-flex items-center justify-center h-10 rounded-lg text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-zinc-400 text-xs mt-8">
            All plans include a 30-day free trial. Cancel anytime before your trial ends and you will not be charged.
          </p>
        </div>
      </section>

      {/* ── FAQ — white ── */}
      <section className="py-24 bg-white border-t border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="text-3xl font-semibold text-zinc-900 tracking-tight">Common questions</h2>
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
      <section className="py-28 bg-zinc-950 border-t border-zinc-800/50">
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
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-10 h-14 text-base rounded transition-colors"
                >
                  Start 30-Day Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2} />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 h-14 text-base rounded transition-colors"
                >
                  <MousePointerClick className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                  View Demo
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-zinc-500 text-sm">
                {['30-day free trial', 'No credit card required', 'Cancel anytime'].map((item, i) => (
                  <span key={item} className="flex items-center gap-2">
                    {i > 0 && <span className="hidden sm:block text-zinc-700">·</span>}
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
              &copy; 2022&ndash;{new Date().getFullYear()} Instant Appraisal. All rights reserved.
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
