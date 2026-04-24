// Client-side rate limiting utility
// Uses localStorage to track submission attempts

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

const RATE_LIMIT_KEY = 'lead_capture_rate_limit';
const MAX_ATTEMPTS = 5; // Maximum submissions allowed
const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const COOLDOWN_MS = 30 * 1000; // 30 seconds between submissions

function getRateLimitData(): RateLimitEntry | null {
  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    if (!data) return null;
    return JSON.parse(data) as RateLimitEntry;
  } catch {
    return null;
  }
}

function setRateLimitData(entry: RateLimitEntry): void {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(entry));
  } catch {
    // localStorage might be disabled
  }
}

export function checkRateLimit(): { 
  allowed: boolean; 
  reason?: string; 
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = getRateLimitData();

  if (!entry) {
    return { allowed: true };
  }

  // Reset if time window has passed
  if (now - entry.firstAttempt > TIME_WINDOW_MS) {
    return { allowed: true };
  }

  // Check cooldown between submissions
  const timeSinceLastAttempt = now - entry.lastAttempt;
  if (timeSinceLastAttempt < COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastAttempt) / 1000);
    return { 
      allowed: false, 
      reason: `Please wait ${retryAfterSeconds} seconds before submitting another address.`,
      retryAfterSeconds
    };
  }

  // Check max attempts in time window
  if (entry.count >= MAX_ATTEMPTS) {
    const resetTime = entry.firstAttempt + TIME_WINDOW_MS;
    const minutesRemaining = Math.ceil((resetTime - now) / 60000);
    return { 
      allowed: false, 
      reason: `Too many submissions. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.`,
      retryAfterSeconds: Math.ceil((resetTime - now) / 1000)
    };
  }

  return { allowed: true };
}

export function recordAttempt(): void {
  const now = Date.now();
  const entry = getRateLimitData();

  if (!entry || now - entry.firstAttempt > TIME_WINDOW_MS) {
    // Start fresh window
    setRateLimitData({
      count: 1,
      firstAttempt: now,
      lastAttempt: now
    });
  } else {
    // Increment existing window
    setRateLimitData({
      count: entry.count + 1,
      firstAttempt: entry.firstAttempt,
      lastAttempt: now
    });
  }
}

export function getRemainingAttempts(): number {
  const now = Date.now();
  const entry = getRateLimitData();

  if (!entry || now - entry.firstAttempt > TIME_WINDOW_MS) {
    return MAX_ATTEMPTS;
  }

  return Math.max(0, MAX_ATTEMPTS - entry.count);
}

// Reset rate limit (useful for testing)
export function resetRateLimit(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {
    // localStorage might be disabled
  }
}