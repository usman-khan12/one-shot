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
      fileStore.delete(fileId)
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      )
    }

    const tempDir = join(process.cwd(), 'temp')
    const filePath = join(tempDir, fileId)

    try {
      // Read the file
      const fileBuffer = await readFile(filePath)

      // Delete the file immediately after reading (one-time use)
      await unlink(filePath)
      fileStore.delete(fileId)

      // Return the file with proper headers
      return new NextResponse(fileBuffer, {
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
