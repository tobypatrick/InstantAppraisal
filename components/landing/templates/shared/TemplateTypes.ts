import type { PublicProfile } from "@/hooks/useAgentProfile";
import type { LeadFormData } from "@/hooks/useLeadCapture";
import type { RateLimitError } from "@/hooks/useLeadCapture";
import type { LandingVariant } from "@/lib/landing-variants";

export type CaptureStep = "address" | "contact" | "loading" | "success";

export interface TemplateProps {
  profile: PublicProfile;
  /** Which audience this page is written for. Defaults to sales. */
  variant: LandingVariant;
  headerBgColor: string;
  pageBgColor: string;
  accentColor: string;
  step: CaptureStep;
  submittedAddress: string;
  reportUrl: string | null;
  onAddressSubmit: (address: string, propertyId?: string) => void;
  onContactSubmit: (data: LeadFormData) => void;
  isAddressLoading: boolean;
  isContactLoading: boolean;
  rateLimitError?: RateLimitError | null;
  onClearRateLimitError?: () => void;
  isGracefulFailure?: boolean;
  gracefulFailureMessage?: string;
  leadId?: string | null;
}
