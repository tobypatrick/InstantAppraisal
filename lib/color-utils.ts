/**
 * Utility functions for color manipulation and contrast detection
 */

/**
 * Parse a hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine if text should be light or dark based on background color
 * Returns true if text should be white, false if text should be black
 */
export function shouldUseLightText(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return true; // Default to light text if parsing fails
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  // WCAG recommends 0.179 as threshold for contrast
  return luminance < 0.179;
}

/**
 * Get contrasting text color class based on background
 */
export function getContrastTextColor(hexColor: string): string {
  return shouldUseLightText(hexColor) ? "text-white" : "text-slate-900";
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Default theme colors
 */
export const DEFAULT_HEADER_COLOR = "#0f172a"; // slate-900
export const DEFAULT_PAGE_COLOR = "#020617"; // slate-950
