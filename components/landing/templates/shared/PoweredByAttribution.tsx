import { LeadAgentLogo } from "@/components/ui/LeadAgentLogo";
import { getContrastTextColor } from "@/lib/color-utils";

interface PoweredByAttributionProps {
  pageBgColor: string;
}

/**
 * Premium "Powered by" attribution footer — CSS animations only.
 */
export function PoweredByAttribution({ pageBgColor }: PoweredByAttributionProps) {
  const textColorClass = getContrastTextColor(pageBgColor);
  const isDark = textColorClass === "text-white";

  return (
    <div
      className="landing-fade-in w-full py-8 flex items-center justify-center"
      style={{ animationDelay: '0.8s' }}
    >
      <a 
        href="https://instantappraisal.co"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${
          isDark ? "text-white/30 hover:text-white/50" : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <span className="text-xs font-medium tracking-wide">Powered by</span>
        <LeadAgentLogo 
          height={14} 
          dark={!isDark}
          className={isDark ? "opacity-40" : "opacity-60"}
        />
      </a>
    </div>
  );
}
