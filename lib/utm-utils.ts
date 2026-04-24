 /**
  * Shared utilities for UTM parameter handling
  */
 
 export interface UTMParams {
   utm_source?: string;
   utm_medium?: string;
   utm_campaign?: string;
 }
 
 /**
  * Extract UTM parameters from URLSearchParams
  */
 export function extractUTMParams(searchParams: URLSearchParams): UTMParams {
   return {
     utm_source: searchParams.get("utm_source") || undefined,
     utm_medium: searchParams.get("utm_medium") || undefined,
     utm_campaign: searchParams.get("utm_campaign") || undefined,
   };
 }
 
 /**
  * Build a URL with UTM parameters
  */
 export function buildUTMUrl(
   baseUrl: string,
   source: string,
   medium: string,
   campaign: string
 ): string {
   const campaignSlug = campaign.toLowerCase().replace(/\s+/g, "-");
   const params = new URLSearchParams({
     utm_source: source,
     utm_medium: medium,
     utm_campaign: campaignSlug,
   });
   return `${baseUrl}?${params.toString()}`;
 }
 
 /**
  * Get source category from UTM source string
  */
 export type SourceCategory = "facebook" | "google" | "other" | "direct";
 
 export function getSourceCategory(utmSource: string | null | undefined): SourceCategory {
   const source = utmSource?.toLowerCase() || "";
   if (source.includes("facebook") || source.includes("fb")) return "facebook";
   if (source.includes("google")) return "google";
   if (source) return "other";
   return "direct";
 }