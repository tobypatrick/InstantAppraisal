import { TemplateHeader } from "./shared/TemplateHeader";
import { FormSteps } from "./shared/FormSteps";
import { VideoEmbed } from "./shared/VideoEmbed";
import { PoweredByAttribution } from "./shared/PoweredByAttribution";
import { ReportPreview } from "./shared/ReportPreview";
import { getContrastTextColor } from "@/lib/color-utils";
import type { TemplateProps } from "./shared/TemplateTypes";

/**
 * The Minimalist Template
 * 
 * Clean, centered stack layout:
 * - Single H1 headline
 * - Large address search bar
 * - VSL video below the fold
 * 
 * Aussie High-End Tech Aesthetic
 * Uses CSS animations only — no framer-motion.
 */
export function MinimalistTemplate({
  profile,
  headerBgColor,
  pageBgColor,
  step,
  submittedAddress,
  reportUrl,
  onAddressSubmit,
  onContactSubmit,
  isAddressLoading,
  isContactLoading,
  rateLimitError,
  onClearRateLimitError,
  isGracefulFailure,
  gracefulFailureMessage,
  leadId,
}: TemplateProps) {
  const textColorClass = getContrastTextColor(pageBgColor);
  const mutedTextClass = textColorClass === "text-white" 
    ? "text-white/60" 
    : "text-slate-600";

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{ backgroundColor: pageBgColor }}
    >
      <TemplateHeader
        agencyLogoUrl={profile.agency_logo_url}
        agencyName={profile.agency_name}
        headerBgColor={headerBgColor}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main Content - Centered Stack */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-24">
        {/* Content Container - Max 560px */}
        <div className="w-full max-w-[560px]">
          
          {/* Hero Section */}
          <div className="landing-fade-in-down text-center mb-10">
            <h1 className={`text-2xl md:text-4xl font-bold ${textColorClass} mb-3 tracking-tight`}>
              Discover Your Property's<br />New Market Value
            </h1>
            <p className={`${mutedTextClass} text-sm md:text-base max-w-md mx-auto`}>
              Get a <strong>free, no-obligation</strong> property report in 30 seconds.
            </p>
            
            {/* Agent attribution */}
            {profile.full_name && (
              <p className={`${mutedTextClass} text-xs mt-4`} style={{ animationDelay: '0.1s' }}>
                Prepared by {profile.full_name}
                {profile.agency_name && ` • ${profile.agency_name}`}
              </p>
            )}

            {/* Social proof */}
            <p className={`${mutedTextClass} text-xs mt-2 font-medium`} style={{ animationDelay: '0.15s' }}>
              Software used by 800+ homeowners this week.
            </p>
          </div>

          {/* Form Steps */}
          <FormSteps
            step={step}
            submittedAddress={submittedAddress}
            reportUrl={reportUrl}
            onAddressSubmit={onAddressSubmit}
            onContactSubmit={onContactSubmit}
            isAddressLoading={isAddressLoading}
            isContactLoading={isContactLoading}
            rateLimitError={rateLimitError}
            onClearRateLimitError={onClearRateLimitError}
            pageBgColor={pageBgColor}
            agentName={profile.full_name}
            isGracefulFailure={isGracefulFailure}
            gracefulFailureMessage={gracefulFailureMessage}
            leadId={leadId}
          />
        </div>

        {/* Report Preview */}
        {step === 'address' && (
          <ReportPreview textColorClass={textColorClass} mutedTextClass={mutedTextClass} />
        )}

        {/* VSL below the fold */}
        {profile.vsl_youtube_url && step === "address" && (
          <div className="w-full max-w-2xl mt-16">
            <VideoEmbed url={profile.vsl_youtube_url} pageBgColor={pageBgColor} />
          </div>
        )}

        {/* Powered by attribution */}
        <div className="mt-auto pt-12">
          <PoweredByAttribution pageBgColor={pageBgColor} />
        </div>
      </div>
    </div>
  );
}
