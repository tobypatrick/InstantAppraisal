import { Database, Server, Zap, Globe } from "lucide-react";
import { getContrastTextColor } from "@/lib/color-utils";

interface LoadingReportProps {
  pageBgColor?: string;
}

export function LoadingReport({ pageBgColor = "#020617" }: LoadingReportProps) {
  const textColorClass = getContrastTextColor(pageBgColor);
  const mutedTextClass = textColorClass === "text-white" 
    ? "text-white/60" 
    : "text-slate-600";

  const steps = [
    { icon: Globe, label: "Fetching PropTrack market data...", delay: "0s" },
    { icon: Server, label: "Connecting to PropTrack API...", delay: "0.8s" },
    { icon: Database, label: "Analysing property records...", delay: "1.6s" },
    { icon: Zap, label: "Generating appraisal insights...", delay: "2.4s" },
  ];

  return (
    <div className="landing-fade-in w-full max-w-md mx-auto text-center">
      {/* Data Processing Animation */}
      <div className="w-20 h-20 mx-auto mb-8 relative">
        {/* Outer ring */}
        <div className="absolute inset-0 border border-accent/30 rounded landing-spin" style={{ animationDuration: '3s' }} />
        {/* Inner ring */}
        <div className="absolute inset-2 border border-accent/50 rounded landing-spin-reverse" />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="landing-pulse">
            <Globe className="h-6 w-6 text-accent" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <h2
        className={`landing-fade-in-up text-xl font-semibold ${textColorClass} mb-2 tracking-tight`}
        style={{ animationDelay: '0.1s' }}
      >
        Fetching Market Data
      </h2>

      <p
        className={`landing-fade-in-up ${mutedTextClass} text-sm mb-8`}
        style={{ animationDelay: '0.15s' }}
      >
        Connecting to PropTrack data services...
      </p>

      {/* Progress Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.label}
            className="landing-fade-in-left flex items-center gap-3 bg-white/5 border border-white/10 rounded px-4 py-3"
            style={{ animationDelay: step.delay }}
          >
            <div className="landing-pulse">
              <step.icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
            </div>
            <span className={`${mutedTextClass} text-sm`}>
              {step.label}
            </span>
            {/* Data flow animation */}
            <div className="flex-1 h-px bg-white/5 overflow-hidden ml-2">
              <div
                className="h-full w-8 bg-gradient-to-r from-transparent via-accent/50 to-transparent landing-slide-right"
                style={{ animationDelay: step.delay }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tech-forward footer */}
      <div
        className="landing-fade-in mt-6"
        style={{ animationDelay: '3s' }}
      >
        <p className={`${mutedTextClass} text-xs`}>
          Integrated with data from PropTrack
        </p>
      </div>
    </div>
  );
}
