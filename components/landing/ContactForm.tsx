import { useState } from "react";
import { User, Mail, Phone, ArrowRight, MapPin, Home, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getContrastTextColor } from "@/lib/color-utils";
import type { LeadFormData } from "@/hooks/useLeadCapture";
import { validateContactForm } from "@/lib/validation";

interface ContactFormProps {
  address: string;
  onSubmit: (data: LeadFormData) => void;
  isLoading: boolean;
  pageBgColor: string;
}

export function ContactForm({ address, onSubmit, isLoading, pageBgColor }: ContactFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    interest_level: "Just Interested",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");

  const textColorClass = getContrastTextColor(pageBgColor);
  const mutedTextClass = textColorClass === "text-white" 
    ? "text-white/60" 
    : "text-slate-600";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateContactForm(formData);
    if (!validation.success) {
      setErrors(validation.errors || {});
    }
    if (!termsAccepted) {
      setTermsError("This field is required.");
    }
    if (!validation.success || !termsAccepted) {
      return;
    }
    
    setErrors({});
    setTermsError("");
    onSubmit(validation.data as LeadFormData);
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const isFormValid =
    formData.contact_name.trim() &&
    formData.contact_email.trim() &&
    formData.contact_phone.trim() &&
    termsAccepted;

  return (
    <div className="landing-fade-in-up w-full max-w-md mx-auto">
      {/* Address Confirmation */}
      <div className="landing-fade-in bg-white/5 border border-white/10 rounded px-4 py-3 mb-6">
        <div className="flex items-center gap-3">
          <MapPin className={`h-4 w-4 ${mutedTextClass}`} strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className={`${mutedTextClass} text-xs uppercase tracking-wide`}>
              Property
            </p>
            <p className={`${textColorClass} text-sm font-medium truncate`}>
              {address}
            </p>
          </div>
        </div>
      </div>

      {/* Blurred Price Preview */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-3">
          <span
            className={`text-4xl md:text-5xl font-bold ${textColorClass} select-none`}
            style={{ filter: 'blur(8px)' }}
            aria-hidden="true"
          >
            $1,250,000
          </span>
        </div>
        <p className={`${mutedTextClass} text-xs mb-4`}>
          Complete the form to reveal your property value.
        </p>
        <h2 className={`text-xl font-semibold ${textColorClass} mb-1 tracking-tight`}>
          Almost There
        </h2>
        <p className={`${mutedTextClass} text-sm`}>
          Where should we send your report?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className={`${mutedTextClass} text-xs`}>
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="name"
              type="text"
              placeholder="John Smith"
              value={formData.contact_name}
              onChange={(e) => handleChange("contact_name", e.target.value)}
              className={`h-11 pl-10 bg-white border border-border text-sm ${
                errors.contact_name ? "ring-1 ring-destructive border-destructive" : ""
              }`}
              disabled={isLoading}
              maxLength={200}
            />
          </div>
          {errors.contact_name && (
            <p className="text-xs text-destructive">{errors.contact_name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className={`${mutedTextClass} text-xs`}>
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              className={`h-11 pl-10 bg-white border border-border text-sm ${
                errors.contact_email ? "ring-1 ring-destructive border-destructive" : ""
              }`}
              disabled={isLoading}
              maxLength={255}
            />
          </div>
          {errors.contact_email && (
            <p className="text-xs text-destructive">{errors.contact_email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className={`${mutedTextClass} text-xs`}>
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              id="phone"
              type="tel"
              placeholder="+61 400 000 000"
              value={formData.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              className={`h-11 pl-10 bg-white border border-border text-sm ${
                errors.contact_phone ? "ring-1 ring-destructive border-destructive" : ""
              }`}
              disabled={isLoading}
              maxLength={20}
            />
          </div>
          {errors.contact_phone && (
            <p className="text-xs text-destructive">{errors.contact_phone}</p>
          )}
        </div>

        {/* Interest Level Toggle */}
        <div className="space-y-1.5 pt-1">
          <Label className={`${mutedTextClass} text-xs`}>
            What's your situation?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChange("interest_level", "Looking to Sell")}
              className={`p-3 rounded border transition-all ${
                formData.interest_level === "Looking to Sell"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-white text-muted-foreground hover:border-accent/50"
              }`}
              disabled={isLoading}
            >
              <Home className="h-4 w-4 mx-auto mb-1.5" strokeWidth={1.5} />
              <span className="text-xs font-medium">Looking to Sell</span>
            </button>
            <button
              type="button"
              onClick={() => handleChange("interest_level", "Just Interested")}
              className={`p-3 rounded border transition-all ${
                formData.interest_level === "Just Interested"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-white text-muted-foreground hover:border-accent/50"
              }`}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mx-auto mb-1.5" strokeWidth={1.5} />
              <span className="text-xs font-medium">Just Interested</span>
            </button>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="space-y-1.5 pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) setTermsError("");
              }}
              disabled={isLoading}
              className="mt-0.5 h-4 w-4 rounded border-border accent-accent shrink-0"
            />
            <span className={`${mutedTextClass} text-xs leading-relaxed`}>
              I agree to the{" "}
              <a href="https://instantappraisal.co/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">Terms &amp; Conditions</a>
              {" "}in respect of the reports and PropTrack data accessed on this website, and consent to Instant Appraisal using my information to contact me about the property market in accordance with our{" "}
              <a href="https://instantappraisal.co/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">Privacy Policy</a>.
            </span>
          </label>
          {termsError && (
            <p className="text-xs text-destructive">{termsError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 mt-4 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full landing-spinner" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Get My Property Report
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
