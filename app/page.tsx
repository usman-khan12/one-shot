'use client'

import { useState, useRef } from 'react'
import FileUpload from './components/FileUpload'
import ShareLink from './components/ShareLink'
import Header from './components/Header'

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<{
    fileId: string
    downloadUrl: string
    originalName: string
    size: number
  } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadSuccess = (data: {
    fileId: string
    downloadUrl: string
    originalName: string
    size: number
  }) => {
    setUploadedFile(data)
    setError(null)
    setIsUploading(false)
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
    setIsUploading(false)
  }

  const handleUploadStart = () => {
    setIsUploading(true)
    setError(null)
    setUploadedFile(null)
  }

  const handleReset = () => {
    setUploadedFile(null)
    setError(null)
    setIsUploading(false)
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full filter blur-3xl opacity-20 float-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-orange-500 to-red-500 rounded-full filter blur-3xl opacity-20 float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full filter blur-3xl opacity-15 float-animation" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text">
                One Shot
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-xl mx-auto leading-relaxed font-light">
                Secure file sharing with a single click. 
                <br />
                <span className="text-white/60">Files disappear after download.</span>
              </p>
            </div>

            {/* Main Upload Area */}
            <div className="glass-strong rounded-3xl p-8 md:p-12 glow">
              {!uploadedFile ? (
                <FileUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  onUploadStart={handleUploadStart}
                  isUploading={isUploading}
                  error={error}
                />
              ) : (
                <ShareLink
                  fileData={uploadedFile}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
