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
        { success: false, error: 'Invalid file ID' },
        { status: 400 }
      )
    }

    // Check if file exists in Supabase storage
    console.log(`File info request for: ${fileId}`)
    
    const { data: fileList, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        search: fileId
      })

    if (listError || !fileList || fileList.length === 0) {
      console.log(`File ${fileId} not found in Supabase storage:`, listError)
      return NextResponse.json(
        { success: false, error: 'File not found or already downloaded' },
        { status: 404 }
      )
    }

    const fileInfo = fileList[0]
    
    // Check if file is too old (5 minutes limit)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    const fileCreatedAt = new Date(fileInfo.created_at).getTime()
    
    if (fileCreatedAt < fiveMinutesAgo) {
      // Delete expired file
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([`${fileId}`])
      
      return NextResponse.json(
        { success: false, error: 'File has expired' },
        { status: 410 }
      )
    }

    // Return file metadata
    return NextResponse.json({
      success: true,
      fileData: {
        filename: fileInfo.name,
        originalName: fileInfo.name,
        size: fileInfo.metadata?.size || 0,
        uploadTime: fileCreatedAt,
        contentType: fileInfo.metadata?.mimetype || 'application/octet-stream'
      }
    })

  } catch (error) {
    console.error('File info error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get file information' },
      { status: 500 }
    )
  }
}
