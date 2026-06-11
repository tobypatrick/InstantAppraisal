import { CheckCircle, FileText, Download, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContrastTextColor } from "@/lib/color-utils";

interface ReportSuccessProps {
  reportUrl: string | null;
  agentName: string | null;
  pageBgColor?: string;
  gracefulFailure?: boolean;
  gracefulFailureMessage?: string;
  leadId?: string | null;
}

export function ReportSuccess({
  reportUrl, 
  agentName, 
  pageBgColor = "#020617",
  gracefulFailure = false,
  gracefulFailureMessage,
  leadId,
}: ReportSuccessProps) {
  const textColorClass = getContrastTextColor(pageBgColor);
  const mutedTextClass = textColorClass === "text-white"
    ? "text-white/60"
    : "text-slate-600";

  // Graceful failure state
  if (gracefulFailure || !reportUrl) {
    return (
      <div className="landing-scale-in w-full max-w-md mx-auto text-center">
        {/* Processing Icon */}
        <div
          className="landing-scale-in w-16 h-16 mx-auto mb-6 border border-accent/30 rounded flex items-center justify-center"
          style={{ animationDelay: '0.1s' }}
        >
          <Clock className="h-7 w-7 text-accent" strokeWidth={1.5} />
        </div>

        <h2
          className={`landing-fade-in-up text-xl font-semibold ${textColorClass} mb-2 tracking-tight`}
          style={{ animationDelay: '0.15s' }}
        >
          Request Received
        </h2>

        <p
          className={`landing-fade-in-up ${mutedTextClass} text-sm mb-6 leading-relaxed`}
          style={{ animationDelay: '0.2s' }}
        >
          {gracefulFailureMessage || "Your request is being processed. An agent will be in touch shortly with your data."}
        </p>

        {/* Info Card */}
        <div
          className="landing-fade-in-up bg-white/5 border border-white/10 rounded p-5 mb-5"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
            <div className="text-left flex-1">
              <p className={`font-medium ${textColorClass} text-sm`}>
                What happens next?
              </p>
              <p className={`text-xs ${mutedTextClass} mt-1`}>
                Your details have been securely saved. {agentName ? `${agentName} will` : "An agent will"} contact you shortly with your personalised property report.
              </p>
            </div>
          </div>
        </div>

        <p
          className={`landing-fade-in ${mutedTextClass} text-xs`}
          style={{ animationDelay: '0.3s' }}
        >
          Thank you for your patience.
        </p>
      </div>
    );
  }

  // Success state
  return (
    <div className="landing-scale-in w-full max-w-md mx-auto text-center">
      {/* Success Icon */}
      <div
        className="landing-scale-in w-16 h-16 mx-auto mb-6 border border-accent/30 rounded flex items-center justify-center"
        style={{ animationDelay: '0.1s' }}
      >
        <CheckCircle className="h-7 w-7 text-accent" strokeWidth={1.5} />
      </div>

      <h2
        className={`landing-fade-in-up text-xl font-semibold ${textColorClass} mb-2 tracking-tight`}
        style={{ animationDelay: '0.15s' }}
      >
        Your Report is Ready
      </h2>

      <p
        className={`landing-fade-in-up ${mutedTextClass} text-sm mb-6`}
        style={{ animationDelay: '0.2s' }}
      >
        Your comprehensive property appraisal report has been generated.
      </p>

      {/* Report Card */}
      <div
        className="landing-fade-in-up bg-white border border-border rounded p-5 mb-5"
        style={{ animationDelay: '0.25s' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center">
            <FileText className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground text-sm">Property Appraisal Report</p>
            <p className="text-xs text-muted-foreground">Powered by PropTrack data</p>
          </div>
        </div>

        <Button
          className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
          onClick={() => window.open(reportUrl, "_blank")}
        >
          <Download className="h-4 w-4 mr-2" strokeWidth={1.5} />
          View My Property Report
        </Button>
      </div>

      {agentName && (
        <p
          className={`landing-fade-in ${mutedTextClass} text-xs`}
          style={{ animationDelay: '0.3s' }}
        >
          {agentName} will be in touch soon to discuss your property.
        </p>
      )}
    </div>
  );
}
