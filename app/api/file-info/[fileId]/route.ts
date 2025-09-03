import { NextRequest, NextResponse } from 'next/server'
import { fileStore } from '@/lib/fileStore'

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

    // Check if file exists in store
    console.log(`File info request for: ${fileId}, store size: ${fileStore.size}`)
    const fileMetadata = fileStore.get(fileId)
    
    if (!fileMetadata) {
      console.log(`File ${fileId} not found in store`)
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
