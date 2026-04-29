import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, MapPin, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getContrastTextColor } from "@/lib/color-utils";
import { suggestAddresses, type AddressSuggestion } from "@/lib/proptrack-api";
import type { RateLimitError } from "@/hooks/useLeadCapture";

interface AddressSearchProps {
  onSubmit: (address: string, propertyId?: string) => void;
  isLoading: boolean;
  rateLimitError?: RateLimitError | null;
  onClearRateLimitError?: () => void;
  pageBgColor: string;
  accentColor?: string;
  variant?: "default" | "glass";
}

export function AddressSearch({
  onSubmit,
  isLoading,
  rateLimitError,
  onClearRateLimitError,
  pageBgColor,
  accentColor = "#10b981",
  variant = "default",
}: AddressSearchProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [apiError, setApiError] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);
  const justSelectedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(address, 300);

  const textColorClass = getContrastTextColor(pageBgColor);
  const mutedTextClass = textColorClass === "text-white" 
    ? "text-white/60" 
    : "text-slate-600";

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }
      if (debouncedQuery.length < 3) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await suggestAddresses(debouncedQuery);
        if (isMounted) {
          setSuggestions(results);
          setShowDropdown(results.length > 0);
          setSelectedIndex(-1);
          setApiError(false);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        if (isMounted) {
          setSuggestions([]);
          setApiError(true);
        }
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    fetchSuggestions();
    return () => { isMounted = false; };
  }, [debouncedQuery]);

  // Handle rate limit countdown
  useEffect(() => {
    if (rateLimitError?.retryAfterSeconds) {
      setCountdown(rateLimitError.retryAfterSeconds);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            onClearRateLimitError?.();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [rateLimitError, onClearRateLimitError]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    const fullAddress = suggestion.address;
    justSelectedRef.current = true;
    setAddress(fullAddress);
    setSelectedPropertyId(suggestion.propertyId);
    setSuggestions([]);
    setShowDropdown(false);
    setError(null);
    inputRef.current?.blur();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = address.trim();
    
    if (trimmedAddress.length < 5) {
      setError("Please enter a valid address");
      return;
    }
    
    setError(null);
    setShowDropdown(false);
    onSubmit(trimmedAddress, selectedPropertyId);
  };

  const handleChange = (value: string) => {
    setAddress(value);
    setSelectedPropertyId(undefined);
    if (error) setError(null);
    if (apiError) setApiError(false);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) setShowDropdown(true);
  };

  const displayError = rateLimitError?.message || error || (apiError ? "Address search is temporarily unavailable. Please try again shortly." : null);
  const isRateLimited = !!rateLimitError;

  const containerClass = variant === "glass"
    ? "backdrop-blur-sm bg-white/5 p-6 rounded-lg border border-white/10"
    : "";

  return (
    <div className={containerClass}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" strokeWidth={1.5} />
            {isSearching && (
              <Loader2
                className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin z-10"
                strokeWidth={1.5}
                style={{ color: accentColor }}
              />
            )}
            <Input
              ref={inputRef}
              type="text"
              placeholder="Start typing your property address..."
              value={address}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              className={`h-12 pl-11 pr-10 text-sm bg-white border border-border focus-visible:ring-1 focus-visible:ring-accent ${
                displayError ? "ring-1 ring-destructive border-destructive" : ""
              }`}
              disabled={isLoading || isRateLimited}
              maxLength={500}
              autoComplete="off"
            />
            
            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="landing-dropdown-in absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.address}-${index}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                        index !== suggestions.length - 1 ? "border-b border-border/50" : ""
                      } ${index === selectedIndex ? "" : "hover:bg-muted/50"}`}
                      style={index === selectedIndex
                        ? { backgroundColor: `${accentColor}1a` /* ~10% alpha */ }
                        : undefined}
                    >
                      <MapPin
                        className="h-4 w-4 mt-0.5 flex-shrink-0"
                        strokeWidth={1.5}
                        style={{ color: accentColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">
                          {suggestion.address}
                        </p>
                        {(suggestion.suburb || suggestion.state || suggestion.postcode) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[suggestion.suburb, suggestion.state, suggestion.postcode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
            )}
          </div>
          
          {displayError && (
            <div
              className={`landing-fade-in-up flex items-center gap-2 text-xs px-3 py-2 rounded ${
                isRateLimited 
                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {isRateLimited && <AlertTriangle className="h-3 w-3 flex-shrink-0" strokeWidth={1.5} />}
              <span>
                {displayError}
                {countdown !== null && countdown > 0 && (
                  <span className="ml-1 font-mono">({countdown}s)</span>
                )}
              </span>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full h-12 text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accentColor }}
          disabled={!address.trim() || isLoading || isRateLimited}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full landing-spinner" />
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Get My Free Report
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </span>
          )}
        </Button>
      </form>

      <p className={`text-center ${mutedTextClass} text-xs mt-4 flex items-center justify-center gap-1.5`}>
        Integrated with data from PropTrack
      </p>
    </div>
  );
}
