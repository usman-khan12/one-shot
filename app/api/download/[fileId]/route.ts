import { NextRequest, NextResponse } from 'next/server'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { fileStore } from '@/lib/fileStore'

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params

    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      )
    }

    // Check if file exists in store first
    console.log(`Download request for: ${fileId}, store size: ${fileStore.size}`)
    console.log(`Available files:`, Array.from(fileStore.keys()))
    
    let fileMetadata = fileStore.get(fileId)
    
    // If not in store (Vercel serverless issue), try to read from file system
    if (!fileMetadata) {
      try {
        const metadataPath = join('/tmp', `${fileId}.meta`)
        const metadataContent = await readFile(metadataPath, 'utf-8')
        fileMetadata = JSON.parse(metadataContent)
        console.log(`File metadata loaded from file system: ${fileMetadata?.originalName || 'unknown'}`)
      } catch (error) {
        console.log(`File ${fileId} not found in store or file system`)
        return NextResponse.json(
          { error: 'File not found or already downloaded' },
          { status: 404 }
        )
      }
    }
    
    // Ensure fileMetadata is not undefined
    if (!fileMetadata) {
      return NextResponse.json(
        { error: 'File not found or already downloaded' },
        { status: 404 }
      )
    }
    
    console.log(`File found: ${fileMetadata.originalName}`)

    // Check if file is too old (5 minutes limit)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    if (fileMetadata.uploadTime < fiveMinutesAgo) {
      fileStore.delete(fileId)
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      )
    }

    const tempDir = '/tmp'
    const filePath = join(tempDir, fileId)

    try {
      // Read the file
      const fileBuffer = await readFile(filePath)

      // Delete the file immediately after reading (one-time use)
      await unlink(filePath)
      fileStore.delete(fileId)
      
      // Also delete metadata file
      try {
        const metadataPath = join('/tmp', `${fileId}.meta`)
        await unlink(metadataPath)
      } catch (error) {
        // Metadata file might already be deleted
      }

      // Return the file with proper headers
      // Convert Buffer to ArrayBuffer to ensure compatibility with NextResponse
      const arrayBuffer = new ArrayBuffer(fileBuffer.length)
      const uint8Array = new Uint8Array(arrayBuffer)
      uint8Array.set(fileBuffer)
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileMetadata.originalName}"`,
          'Content-Length': fileMetadata.size.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })

    } catch (fileError) {
      // File might have been deleted already
      fileStore.delete(fileId)
      return NextResponse.json(
        { error: 'File not found or already downloaded' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
