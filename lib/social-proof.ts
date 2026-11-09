/** Shown until an agent sets their own number under Dashboard, Settings. */
export const DEFAULT_SOCIAL_PROOF_COUNT = 800
export const MAX_SOCIAL_PROOF_COUNT = 99999

export function socialProofLine(count: number | null | undefined): string {
  return `Used by ${count ?? DEFAULT_SOCIAL_PROOF_COUNT}+ homeowners this week`
}
