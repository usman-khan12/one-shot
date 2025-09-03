import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'One Shot - Secure File Sharing',
  description: 'Upload files and share them with a one-time download link. Files are automatically deleted after use.',
  keywords: 'file sharing, secure, one-time, temporary, upload, download',
  authors: [{ name: 'One Shot' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-black">
          {children}
        </div>
      </body>
    </html>
  )
}
