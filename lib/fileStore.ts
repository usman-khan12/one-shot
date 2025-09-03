// Shared file store for the application
// In production, this should be replaced with Redis or a database

export interface FileMetadata {
  filename: string
  originalName: string
  size: number
  uploadTime: number
}

// Global stores that persist across requests
declare global {
  var __fileStore: Map<string, FileMetadata> | undefined
  var __rateLimitStore: Map<string, { count: number; resetTime: number }> | undefined
}

// Use global variables to ensure the stores persist across requests
export const fileStore = globalThis.__fileStore ?? (globalThis.__fileStore = new Map<string, FileMetadata>())
export const rateLimitStore = globalThis.__rateLimitStore ?? (globalThis.__rateLimitStore = new Map<string, { count: number; resetTime: number }>())

// Cleanup function to remove expired files
export function cleanupExpiredFiles() {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
  
  const entries = Array.from(fileStore.entries())
  for (const [id, metadata] of entries) {
    if (metadata.uploadTime < fiveMinutesAgo) {
      fileStore.delete(id)
    }
  }
}

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
