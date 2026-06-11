import { useState, useCallback } from "react";
import { CheckCircle, FileText, Download, Clock, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContrastTextColor } from "@/lib/color-utils";

interface EstimatedValue {
  low: number;
  mid: number;
  high: number;
}

interface ReportSuccessProps {
  reportUrl: string | null;
  agentName: string | null;
  pageBgColor?: string;
  gracefulFailure?: boolean;
  gracefulFailureMessage?: string;
  leadId?: string | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
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

  const [estimatedValue, setEstimatedValue] = useState<EstimatedValue | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReveal = useCallback(async () => {
    if (!leadId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads/get-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.estimated_value) {
        setEstimatedValue(data.estimated_value);
      }
      // Reveal regardless — the UI handles the unavailable case
      setIsRevealed(true);
    } catch {
      setIsRevealed(true);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

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

      {/* Estimated Value Card */}
      {leadId && (
        <div
          className="landing-fade-in-up mb-5 relative overflow-hidden rounded border border-white/10 bg-white/5 p-6"
          style={{ animationDelay: '0.22s' }}
        >
          <p className={`text-xs uppercase tracking-widest ${mutedTextClass} mb-2`}>
            Estimated Property Value
          </p>

          <div className="relative">
            {/* Blurred placeholder / Revealed value */}
            <div
              className={`transition-all duration-700 ease-out ${
                isRevealed ? "blur-0 opacity-100" : "blur-lg opacity-50 select-none"
              }`}
              aria-hidden={!isRevealed}
            >
              {isRevealed && estimatedValue ? (
                <div>
                  <p className={`text-3xl font-bold ${textColorClass} tracking-tight`}>
                    {formatCurrency(estimatedValue.mid)}
                  </p>
                  <p className={`text-xs ${mutedTextClass} mt-1`}>
                    Range: {formatCurrency(estimatedValue.low)} – {formatCurrency(estimatedValue.high)}
                  </p>
                </div>
              ) : isRevealed ? (
                <p className={`text-lg font-semibold ${textColorClass}`}>
                  Estimate unavailable
                </p>
              ) : (
                /* Dummy placeholder text — not the real value */
                <div>
                  <p className={`text-3xl font-bold ${textColorClass} tracking-tight`}>
                    $1 – $10,000,000
                  </p>
                  <p className={`text-xs ${mutedTextClass} mt-1`}>
                    Range: $1 – $10,000,000
                  </p>
                </div>
              )}
            </div>

            {/* Reveal button overlay */}
            {!isRevealed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={handleReveal}
                  disabled={isLoading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-lg"
                  size="sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      Loading…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                      Reveal estimate
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

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
