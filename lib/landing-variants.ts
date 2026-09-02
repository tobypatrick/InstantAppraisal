/**
 * Landing page variants — sales (agents) and rental (property managers).
 *
 * Same product, same price, same PropTrack call. The report PropTrack generates
 * already carries the rental figure, so the only thing that differs between a
 * sales agent's page and a property manager's page is the wording.
 *
 * All audience-specific copy lives here so a variant is a data change, not a
 * second template.
 *
 * NOTE ON THE RENTAL CARD LABELS: these describe what the visitor will find in
 * the PropTrack report. The sales set is verified against the live report. The
 * rental set is written to match the same document read for a rental audience
 * and STILL NEEDS AN EYEBALL against one generated report before this ships, so
 * the labels match what the figure is actually called in there.
 */

export type LandingVariant = 'sales' | 'rental'

export const LANDING_VARIANTS: readonly LandingVariant[] = ['sales', 'rental'] as const

export function normaliseVariant(value: string | null | undefined): LandingVariant {
  return value === 'rental' ? 'rental' : 'sales'
}

/** Icon keys resolved to lucide components by ReportPreview. */
export type ReportCardIcon =
  | 'trending'
  | 'home'
  | 'clock'
  | 'chart'
  | 'dollar'
  | 'grid'
  | 'users'
  | 'school'

export type InterestIcon = 'building' | 'key' | 'door' | 'house' | 'eye'

export interface InterestOption {
  /** Stored verbatim in leads.interest_level. Must match the DB CHECK. */
  value: string
  icon: InterestIcon
}

export interface ReportCard {
  icon: ReportCardIcon
  label: string
  desc: string
}

export interface VariantCopy {
  /** Landing page hero */
  heroTitle: readonly [string, string]
  heroSubtitle: string
  heroSubtitleStrong: string
  socialProof: string
  /** Report preview grid */
  reportEyebrow: string
  reportCards: readonly ReportCard[]
  /** Contact form */
  interestQuestion: string
  interestOptions: readonly InterestOption[]
  /** The option worth flagging to the agent or BDM as hot */
  hotInterest: string
  /** Pre-selected option, or '' to force a choice */
  defaultInterest: string
  /** Success step */
  successReportLabel: string
  successPendingReport: string
  /** Link preview / SEO */
  metaTitle: string
  metaDescriptionNoun: string
  /** Dashboard settings control */
  settingsLabel: string
  settingsDescription: string
  /**
   * Email copy. "Property report" is deliberately NOT varied (Toby, 2 Sept
   * 2026) — the PropTrack document is a property report either way.
   */
  email: {
    /** To the owner: confirmation they requested an appraisal */
    confirmSubject: string
    confirmThanks: string
    confirmDiscuss: string
    confirmContents: string
    /** To the agent or BDM: a completed lead */
    notifyCompleted: string
    notifyLeadType: string
    notifyOwnerNoun: string
    notifyPartialSearch: string
    notifyProspectTip: string
    /** To the agent or BDM: over the monthly cap */
    limitOwnersPlural: string
  }
}

const SALES: VariantCopy = {
  heroTitle: ["Discover Your Property's", 'New Market Value'],
  heroSubtitle: 'property report in 30 seconds.',
  heroSubtitleStrong: 'free, no-obligation',
  socialProof: 'Used by 800+ homeowners this week',
  reportEyebrow: "What's in your free report",
  reportCards: [
    { icon: 'trending', label: 'Estimated Value', desc: 'Instant valuation with confidence rating' },
    { icon: 'home', label: 'Property Details', desc: 'Beds, baths, land size & more' },
    { icon: 'clock', label: 'Property History', desc: 'Full sold & leased timeline' },
    { icon: 'chart', label: 'Comparable Sales', desc: 'Recent nearby sales with prices' },
    { icon: 'dollar', label: 'Market Insights', desc: 'Median price, days on market' },
    { icon: 'grid', label: 'Price Guide', desc: 'Breakdown by bedroom count' },
    { icon: 'users', label: 'Potential Buyers', desc: 'Live buyer demand from realestate.com.au' },
    { icon: 'school', label: 'Nearby Schools', desc: 'Schools within the catchment area' },
  ],
  interestQuestion: "What's your situation?",
  interestOptions: [
    { value: 'Looking to Sell', icon: 'house' },
    { value: 'Just Interested', icon: 'eye' },
  ],
  hotInterest: 'Looking to Sell',
  defaultInterest: 'Just Interested',
  successReportLabel: 'Property Appraisal Report',
  successPendingReport: 'personalised property report',
  metaTitle: 'Instant, Free Property Report',
  metaDescriptionNoun: 'property value update',
  settingsLabel: 'Sales appraisals',
  settingsDescription: 'For sales agents. The page asks homeowners what their property is worth to sell.',
  email: {
    confirmSubject: 'Your Instant Property Appraisal',
    confirmThanks: 'a property appraisal',
    confirmDiscuss: "your property's value",
    confirmContents:
      "your estimated value range, recent comparable sales in your area, and local market insights — everything you need to understand your property's current market position",
    notifyCompleted: 'A homeowner has completed an instant appraisal on your page.',
    notifyLeadType: 'This is a warm seller lead',
    notifyOwnerNoun: 'A homeowner',
    notifyPartialSearch: 'a property valuation',
    notifyProspectTip:
      'This is a market activity signal. Consider a letterbox drop, door knock, or check if it is a nearby listing you could prospect.',
    limitOwnersPlural: 'Your homeowners',
  },
}

const RENTAL: VariantCopy = {
  heroTitle: ["Discover Your Property's", 'Rental Value'],
  heroSubtitle: 'rental appraisal in 30 seconds.',
  heroSubtitleStrong: 'free, no-obligation',
  socialProof: 'Used by 800+ property owners this week',
  reportEyebrow: "What's in your free rental appraisal",
  reportCards: [
    { icon: 'trending', label: 'Estimated Rent', desc: 'Instant rental estimate with confidence rating' },
    { icon: 'home', label: 'Property Details', desc: 'Beds, baths, land size & more' },
    { icon: 'clock', label: 'Property History', desc: 'Full sold & leased timeline' },
    { icon: 'chart', label: 'Comparable Rentals', desc: 'Recent nearby leases with rents' },
    { icon: 'dollar', label: 'Market Insights', desc: 'Median rent, days on market' },
    { icon: 'grid', label: 'Rent Guide', desc: 'Breakdown by bedroom count' },
    { icon: 'users', label: 'Tenant Demand', desc: 'Live renter demand from realestate.com.au' },
    { icon: 'school', label: 'Nearby Schools', desc: 'Schools within the catchment area' },
  ],
  interestQuestion: 'How is the property currently used?',
  interestOptions: [
    { value: 'Tenanted, managed by an agency', icon: 'building' },
    { value: 'Tenanted, I manage it myself', icon: 'key' },
    { value: 'Vacant or between tenants', icon: 'door' },
    { value: 'I live in it', icon: 'house' },
  ],
  hotInterest: 'Vacant or between tenants',
  // No honest neutral answer here, unlike "Just Interested" on the sales side.
  // Pre-selecting one would file a factual claim the owner never made, so the
  // rental form requires a choice.
  defaultInterest: '',
  successReportLabel: 'Rental Appraisal Report',
  successPendingReport: 'personalised rental appraisal',
  metaTitle: 'Instant, Free Rental Appraisal',
  metaDescriptionNoun: 'rental value update',
  settingsLabel: 'Rental appraisals',
  settingsDescription: 'For property management BDMs. The page asks owners what their property is worth to rent.',
  email: {
    confirmSubject: 'Your Instant Rental Appraisal',
    confirmThanks: 'a rental appraisal',
    confirmDiscuss: 'what your property could rent for',
    confirmContents:
      'your estimated rent range, recent comparable rentals in your area, and local market insights — everything you need to understand what your property could earn',
    notifyCompleted: 'An owner has completed a rental appraisal on your page.',
    notifyLeadType: 'This is a warm landlord lead',
    notifyOwnerNoun: 'An owner',
    notifyPartialSearch: 'a rental appraisal',
    notifyProspectTip:
      'This is a market activity signal. Consider a letterbox drop or door knock, or check whether it is a nearby rental you could approach.',
    limitOwnersPlural: 'Your owners',
  },
}

const COPY: Record<LandingVariant, VariantCopy> = { sales: SALES, rental: RENTAL }

export function variantCopy(variant: string | null | undefined): VariantCopy {
  return COPY[normaliseVariant(variant)]
}
