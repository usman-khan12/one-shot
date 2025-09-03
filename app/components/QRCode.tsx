'use client'

import { useEffect, useRef, useState } from 'react'
import QRCodeLib from 'qrcode'

interface QRCodeProps {
  url: string
  size?: number
  className?: string
}

export default function QRCode({ url, size = 200, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return

      try {
        setIsGenerating(true)
        setError(null)
        
        await QRCodeLib.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        })
        
        setIsGenerating(false)
      } catch (err) {
        console.error('QR Code generation failed:', err)
        setError('Failed to generate QR code')
        setIsGenerating(false)
      }
    }

    generateQR()
  }, [url, size])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <p className="text-sm text-gray-500 text-center p-4">Failed to generate QR code</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        {isGenerating && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
            style={{ width: size, height: size }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`rounded-lg ${isGenerating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          style={{ width: size, height: size }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Scan to download
      </p>
    </div>
  )
}
