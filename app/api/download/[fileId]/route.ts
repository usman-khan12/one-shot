import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
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

    // Check if file exists in store
    console.log(`Download request for: ${fileId}, store size: ${fileStore.size}`)
    console.log(`Available files:`, Array.from(fileStore.keys()))
    
    const fileMetadata = fileStore.get(fileId)
    if (!fileMetadata) {
      console.log(`File ${fileId} not found in store`)
      return NextResponse.json(
        { error: 'File not found or already downloaded' },
        { status: 404 }
      )
    }
    
    console.log(`File found: ${fileMetadata.originalName}`)

    // Check if file is too old (5 minutes limit)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    if (fileMetadata.uploadTime < fiveMinutesAgo) {
      // Delete from Vercel Blob if it exists
      if (fileMetadata.blobUrl) {
        try {
          await del(fileMetadata.blobUrl)
        } catch (error) {
          console.log('Error deleting blob:', error)
        }
      }
      fileStore.delete(fileId)
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      )
    }

    // Delete from Vercel Blob (one-time use)
    if (fileMetadata.blobUrl) {
      try {
        await del(fileMetadata.blobUrl)
        console.log(`Deleted blob: ${fileMetadata.blobUrl}`)
      } catch (error) {
        console.log('Error deleting blob:', error)
      }
    }
    
    // Remove from store
    fileStore.delete(fileId)

    // Redirect to the blob URL for download (if it still exists)
    if (fileMetadata.blobUrl) {
      return NextResponse.redirect(fileMetadata.blobUrl)
    } else {
      return NextResponse.json(
        { error: 'File not available' },
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
