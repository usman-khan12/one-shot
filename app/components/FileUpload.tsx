'use client'

import { useState, useRef, useCallback } from 'react'

interface FileUploadProps {
  onUploadSuccess: (data: {
    fileId: string
    downloadUrl: string
    originalName: string
    size: number
  }) => void
  onUploadError: (error: string) => void
  onUploadStart: () => void
  isUploading: boolean
  error: string | null
}

export default function FileUpload({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  isUploading,
  error
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      onUploadError('File size must be less than 50MB')
      return
    }

    // Validate file type
    const allowedTypes = [
      'image/', 'application/pdf', 'text/', 'application/msword',
      'application/vnd.openxmlformats-officedocument', 'application/zip',
      'application/x-rar-compressed', 'application/x-7z-compressed',
      'video/', 'audio/'
    ]
    
    const isValidType = allowedTypes.some(type => file.type.startsWith(type))
    if (!isValidType) {
      onUploadError('File type not supported')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    onUploadStart()

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUploadSuccess({
        fileId: data.fileId,
        downloadUrl: data.downloadUrl,
        originalName: selectedFile.name,
        size: selectedFile.size
      })
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white/90 mb-3">
          Upload Your File
        </h2>
        <p className="text-white/60 text-base">
          Drag and drop or click to select
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-500 ${
          dragActive
            ? 'border-white/40 glass-strong glow-strong'
            : 'border-white/20 glass hover:border-white/30 hover:glow'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          disabled={isUploading}
        />
        
        {!selectedFile ? (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto glass rounded-3xl flex items-center justify-center glow">
              <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg text-white/90 font-medium mb-2">
                Choose a file or drag it here
              </p>
              <p className="text-white/50 text-sm">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto glass rounded-3xl flex items-center justify-center glow">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg text-white/90 font-medium mb-2 truncate">
                {selectedFile.name}
              </p>
              <p className="text-white/50 text-sm">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-white/60 hover:text-white/90 transition-colors duration-200 text-sm"
            >
              Choose different file
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 glass rounded-2xl p-4 border border-red-400/30">
          <p className="text-red-300 text-center text-sm">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="mt-8 text-center">
          <button
            onClick={uploadFile}
            disabled={isUploading}
            className={`px-12 py-4 rounded-2xl font-semibold text-base transition-all duration-300 transform ${
              isUploading
                ? 'glass cursor-not-allowed text-white/50'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:scale-105 active:scale-95 glow-strong'
            } text-white`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload & Get Link'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
