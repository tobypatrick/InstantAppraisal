import { AddressSearch } from "./AddressSearch";
import { ContactForm } from "@/components/landing/ContactForm";
import { LoadingReport } from "@/components/landing/LoadingReport";
import { ReportSuccess } from "@/components/landing/ReportSuccess";
import type { CaptureStep, TemplateProps } from "./TemplateTypes";

interface FormStepsProps {
  step: CaptureStep;
  submittedAddress: string;
  reportUrl: string | null;
  onAddressSubmit: (address: string, propertyId?: string) => void;
  onContactSubmit: TemplateProps["onContactSubmit"];
  isAddressLoading: boolean;
  isContactLoading: boolean;
  rateLimitError?: TemplateProps["rateLimitError"];
  onClearRateLimitError?: () => void;
  pageBgColor: string;
  accentColor: string;
  agentName?: string | null;
  isGracefulFailure?: boolean;
  gracefulFailureMessage?: string;
  variant?: "default" | "glass";
  leadId?: string | null;
}

export function FormSteps({
  step,
  submittedAddress,
  reportUrl,
  onAddressSubmit,
  onContactSubmit,
  isAddressLoading,
  isContactLoading,
  rateLimitError,
  onClearRateLimitError,
  pageBgColor,
  accentColor,
  agentName,
  isGracefulFailure,
  gracefulFailureMessage,
  variant = "default",
  leadId,
}: FormStepsProps) {
  const glassClass = variant === "glass" 
    ? "backdrop-blur-sm bg-white/5 p-6 rounded-lg border border-white/10" 
    : "";

  return (
    <div>
      {step === "address" && (
        <div key="address" className="landing-fade-in-up">
          <AddressSearch
            onSubmit={onAddressSubmit}
            isLoading={isAddressLoading}
            rateLimitError={rateLimitError}
            onClearRateLimitError={onClearRateLimitError}
            pageBgColor={pageBgColor}
            accentColor={accentColor}
            variant={variant}
          />
        </div>
      )}

      {step === "contact" && (
        <div key="contact" className={`landing-fade-in-up ${glassClass}`}>
          <ContactForm
            address={submittedAddress}
            onSubmit={onContactSubmit}
            isLoading={isContactLoading}
            pageBgColor={pageBgColor}
          />
        </div>
      )}

      {step === "loading" && (
        <div key="loading" className="landing-fade-in-up">
          <LoadingReport pageBgColor={pageBgColor} />
        </div>
      )}

      {step === "success" && (
        <div key="success" className="landing-fade-in-up">
          <ReportSuccess
            reportUrl={reportUrl}
            agentName={agentName ?? null}
            pageBgColor={pageBgColor}
            gracefulFailure={isGracefulFailure}
            gracefulFailureMessage={gracefulFailureMessage}
            leadId={leadId}
          />
        </div>
      )}
    </div>
  );
}
