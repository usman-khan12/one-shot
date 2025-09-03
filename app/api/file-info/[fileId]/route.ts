import { NextRequest, NextResponse } from 'next/server'
import { fileStore } from '@/lib/fileStore'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params

    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid file ID' },
        { status: 400 }
      )
    }

    // Check if file exists in store first
    let fileMetadata = fileStore.get(fileId)
    
    // If not in store (Vercel serverless issue), try to read from file system
    if (!fileMetadata) {
      try {
        const metadataPath = join('/tmp', `${fileId}.meta`)
        const metadataContent = await readFile(metadataPath, 'utf-8')
        fileMetadata = JSON.parse(metadataContent)
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'File not found or already downloaded' },
          { status: 404 }
        )
      }
    }

    // Ensure fileMetadata is not undefined
    if (!fileMetadata) {
      return NextResponse.json(
        { success: false, error: 'File not found or already downloaded' },
        { status: 404 }
      )
    }

    // Check if file is too old (5 minutes limit)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    if (fileMetadata.uploadTime < fiveMinutesAgo) {
      fileStore.delete(fileId)
      return NextResponse.json(
        { success: false, error: 'File has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      fileData: fileMetadata
    })

  } catch (error) {
    console.error('File info error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get file information' },
      { status: 500 }
    )
  }
}
