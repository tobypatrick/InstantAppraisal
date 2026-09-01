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
  /** Success step */
  successReportLabel: string
  successPendingReport: string
  /** Link preview / SEO */
  metaTitle: string
  metaDescriptionNoun: string
  /** Dashboard settings control */
  settingsLabel: string
  settingsDescription: string
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
  successReportLabel: 'Property Appraisal Report',
  successPendingReport: 'personalised property report',
  metaTitle: 'Instant, Free Property Report',
  metaDescriptionNoun: 'property value update',
  settingsLabel: 'Sales appraisals',
  settingsDescription: 'For sales agents. The page asks homeowners what their property is worth to sell.',
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
  successReportLabel: 'Rental Appraisal Report',
  successPendingReport: 'personalised rental appraisal',
  metaTitle: 'Instant, Free Rental Appraisal',
  metaDescriptionNoun: 'rental value update',
  settingsLabel: 'Rental appraisals',
  settingsDescription: 'For property managers. The page asks owners what their property is worth to rent.',
}

const COPY: Record<LandingVariant, VariantCopy> = { sales: SALES, rental: RENTAL }

export function variantCopy(variant: string | null | undefined): VariantCopy {
  return COPY[normaliseVariant(variant)]
}
