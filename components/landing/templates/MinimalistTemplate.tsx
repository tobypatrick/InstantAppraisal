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
      <div className="relative z-10 flex flex-col items-center px-4 pt-16 md:pt-24 pb-20">
        {/* Content Container - Max 580px */}
        <div className="w-full max-w-[580px]">

          {/* Hero Section */}
          <div className="landing-fade-in-down text-center mb-8 md:mb-10">
            {/* Trust badge above heading */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-5 ${mutedTextClass}`}
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Powered by PropTrack data
            </div>

            <h1 className={`text-3xl md:text-5xl font-bold ${textColorClass} mb-4 tracking-tight leading-[1.1]`}>
              Discover Your Property's<br />New Market Value
            </h1>
            <p className={`${mutedTextClass} text-sm md:text-base max-w-md mx-auto leading-relaxed`}>
              Get a <strong>free, no-obligation</strong> property report in 30 seconds.
            </p>

            {/* Agent attribution + social proof, condensed */}
            <div className="mt-5 space-y-1">
              {profile.full_name && (
                <p className={`${mutedTextClass} text-xs`}>
                  Prepared by <span className="font-medium">{profile.full_name}</span>
                  {profile.agency_name && <> · {profile.agency_name}</>}
                </p>
              )}
              <p className={`${mutedTextClass} text-xs opacity-75`}>
                Used by 800+ homeowners this week
              </p>
            </div>
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
