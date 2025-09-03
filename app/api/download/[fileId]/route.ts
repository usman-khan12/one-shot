import { NextRequest, NextResponse } from 'next/server'
import { supabase, STORAGE_BUCKET } from '@/lib/supabase'

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

    // Get file from Supabase storage
    console.log(`Download request for: ${fileId}`)
    
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(`${fileId}`)

    if (downloadError || !fileData) {
      console.log(`File ${fileId} not found in Supabase storage:`, downloadError)
      return NextResponse.json(
        { error: 'File not found or already downloaded' },
        { status: 404 }
      )
    }

    // Get file metadata
    const { data: fileInfo } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        search: fileId
      })

    // Delete file from storage (one-time use)
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([`${fileId}`])

    if (deleteError) {
      console.error('Error deleting file:', deleteError)
    } else {
      console.log(`Deleted file from Supabase storage: ${fileId}`)
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Get original filename from file info or use fileId
    const originalName = fileInfo?.[0]?.name || `${fileId}`
    
    // Return the file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': fileData.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${originalName}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
