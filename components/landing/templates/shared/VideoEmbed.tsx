import { getContrastTextColor } from "@/lib/color-utils";

interface VideoEmbedProps {
  url: string;
  pageBgColor: string;
  className?: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideoEmbed({ url, pageBgColor, className = "" }: VideoEmbedProps) {
  const videoId = extractYouTubeId(url);
  const textColorClass = getContrastTextColor(pageBgColor);
  const glowColor = textColorClass === "text-white" 
    ? "rgba(255,255,255,0.08)" 
    : "rgba(0,0,0,0.08)";

  if (!videoId) return null;

  return (
    <div
      className={`landing-fade-in-up relative w-full ${className}`}
      style={{ animationDelay: '0.2s' }}
    >
      <div 
        className="relative rounded-lg overflow-hidden aspect-video"
        style={{
          boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`,
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
