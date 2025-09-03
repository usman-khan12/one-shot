'use client'

import { useState } from 'react'
import QRCode from './QRCode'

interface ShareLinkProps {
  fileData: {
    fileId: string
    downloadUrl: string
    originalName: string
    size: number
  }
  onReset: () => void
}

export default function ShareLink({ fileData, onReset }: ShareLinkProps) {
  const [copied, setCopied] = useState(false)
  const [downloadCount, setDownloadCount] = useState(0)

  const fullUrl = `${window.location.origin}/download/${fileData.fileId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
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
        <div className="w-20 h-20 mx-auto glass rounded-3xl flex items-center justify-center mb-6 glow float-animation">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white/90 mb-3">
          File Ready to Share!
        </h2>
        <p className="text-white/60 text-base">
          Your file has been uploaded securely
        </p>
      </div>

      {/* File Info */}
      <div className="glass rounded-2xl p-6 mb-8 glow">
        <div className="flex items-center space-x-4">
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
      </div>

      {/* Download Link and QR Code */}
      <div className="space-y-6">
        <label className="block text-white/90 font-medium text-base">
          Share this link:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 glass rounded-2xl p-4 glow">
            <p className="text-white/70 text-sm break-all">
              {fullUrl}
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className={`px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
              copied
                ? 'bg-gradient-to-r from-green-500 to-green-600 glow-strong'
                : 'glass hover:glow text-white/90'
            }`}
          >
            {copied ? (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </div>
            )}
          </button>
        </div>

        {/* QR Code Section */}
        <div className="glass rounded-2xl p-6 glow">
          <div className="text-center mb-4">
            <h3 className="text-white/90 font-medium text-lg mb-2">
              Or scan QR code
            </h3>
            <p className="text-white/60 text-sm">
              Perfect for sharing with mobile devices
            </p>
          </div>
          <div className="flex justify-center">
            <QRCode url={fullUrl} size={180} />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 glass rounded-2xl p-6 glow">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 glass rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 glow">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-yellow-300 font-medium mb-2 text-sm">
              One-Time Use Only
            </h4>
            <p className="text-white/60 text-xs">
              This file will be automatically deleted after the first download or in 5 minutes. 
              Make sure to save it if you need it later.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onReset}
          className="flex-1 px-6 py-4 glass hover:glow text-white/90 rounded-2xl font-medium transition-all duration-300"
        >
          Upload Another File
        </button>
        <a
          href={`/download/${fileData.fileId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl font-medium transition-all duration-300 text-center glow-strong hover:scale-105 active:scale-95"
        >
          Test Download
        </a>
      </div>
    </div>
  )
}
