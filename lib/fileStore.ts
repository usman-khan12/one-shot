// Rate limiting store for the application
// Files are now stored in Supabase, this is only for rate limiting

// Global rate limit store that persists across requests
declare global {
  var __rateLimitStore: Map<string, { count: number; resetTime: number }> | undefined
}

// Use global variable to ensure the rate limit store persists across requests
export const rateLimitStore = globalThis.__rateLimitStore ?? (globalThis.__rateLimitStore = new Map<string, { count: number; resetTime: number }>())

// Cleanup function for rate limit store
export function cleanupExpiredRateLimits() {
  const now = Date.now()
  
  const entries = Array.from(rateLimitStore.entries())
  for (const [ip, data] of entries) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip)
    }
  }
}
