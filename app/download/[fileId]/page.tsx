'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface FileMetadata {
  filename: string
  originalName: string
  size: number
  uploadTime: number
}

export default function DownloadPage() {
  const params = useParams()
  const fileId = params.fileId as string
  const [fileData, setFileData] = useState<FileMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!fileId) return

    // Check if file exists and get metadata
    fetch(`/api/file-info/${fileId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setFileData(data.fileData)
        } else {
          setError(data.error || 'File not found')
        }
      })
      .catch(err => {
        setError('Failed to load file information')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [fileId])

  const handleDownload = async () => {
    if (!fileId) return

    setDownloading(true)
    try {
      const response = await fetch(`/api/download/${fileId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }

      // Get filename from response headers or use fileId
      const contentDisposition = response.headers.get('content-disposition')
      let filename = fileId
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Redirect to success page or show success message
      setError('File downloaded successfully! This file has been deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTimeRemaining = (uploadTime: number) => {
    const now = Date.now()
    const expirationTime = uploadTime + (5 * 60 * 1000) // 5 minutes
    const remaining = expirationTime - now
    
    if (remaining <= 0) return 'Expired'
    
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading file...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white/90 mb-4">File Not Available</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-300 glow-strong"
          >
            Upload New File
          </a>
        </div>
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 text-lg">No file data available</p>
        </div>
      </div>
    )
  }

  const timeRemaining = getTimeRemaining(fileData.uploadTime)
  const isExpired = timeRemaining === 'Expired'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white/90 mb-2">Download File</h1>
          <p className="text-white/60">One-time download available</p>
        </div>

        {/* File Info Card */}
        <div className="glass rounded-2xl p-6 mb-6 glow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center glow">
              <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white/90 font-medium text-lg truncate">
                {fileData.originalName}
              </h3>
              <p className="text-white/50 text-sm">
                {formatFileSize(fileData.size)}
              </p>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-between p-3 glass rounded-xl glow">
            <span className="text-white/70 text-sm">Time remaining:</span>
            <span className={`font-mono text-sm ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading || isExpired}
          className={`w-full py-4 rounded-2xl font-medium text-base transition-all duration-300 ${
            downloading || isExpired
              ? 'glass cursor-not-allowed text-white/50'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white hover:scale-105 active:scale-95 glow-strong'
          }`}
        >
          {downloading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
              <span>Downloading...</span>
            </div>
          ) : isExpired ? (
            'File Expired'
          ) : (
            'Download File'
          )}
        </button>

        {/* Warning */}
        <div className="mt-6 p-4 glass rounded-2xl glow">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 glass rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 glow">
              <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="text-yellow-300 font-medium text-sm mb-1">
                One-Time Download
              </h4>
              <p className="text-white/60 text-xs">
                This file will be automatically deleted after download or when it expires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
