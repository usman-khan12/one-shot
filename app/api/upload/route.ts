import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { fileStore, rateLimitStore, cleanupExpiredFiles, cleanupExpiredRateLimits } from '@/lib/fileStore'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 uploads per 15 minutes per IP

// Allowed file types for security
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
  'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'
]

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(ip)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  userLimit.count++
  return true
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 413 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Generate unique ID and use Vercel's writable /tmp directory
    const fileId = uuidv4()
    const tempDir = '/tmp'
    
    // Save file to temp directory
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(tempDir, fileId)
    
    await writeFile(filePath, buffer)

    // Store file metadata
    const metadata = {
      filename: fileId,
      originalName: file.name,
      size: file.size,
      uploadTime: Date.now()
    }
    fileStore.set(fileId, metadata)
    
    // Also store metadata in file system for Vercel compatibility
    const metadataPath = join('/tmp', `${fileId}.meta`)
    await writeFile(metadataPath, JSON.stringify(metadata))
    
    console.log(`File uploaded: ${fileId}, store size: ${fileStore.size}`)

    // Clean up old files and rate limits
    cleanupExpiredFiles()
    cleanupExpiredRateLimits()
    
    // Also clean up actual files from temp directory
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    const entries = Array.from(fileStore.entries())
    for (const [id, metadata] of entries) {
      if (metadata.uploadTime < fiveMinutesAgo) {
        try {
          const { unlink } = await import('fs/promises')
          await unlink(join('/tmp', id))
          await unlink(join('/tmp', `${id}.meta`))
        } catch (error) {
          // File might already be deleted
        }
      }
    }

    return NextResponse.json({
      success: true,
      fileId,
      downloadUrl: `/api/download/${fileId}`,
      expiresIn: '5 minutes'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// File store is now shared via lib/fileStore.ts
