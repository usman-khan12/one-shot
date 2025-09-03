# One Shot - Secure File Sharing

A modern, secure file sharing web application that allows users to upload files and generate one-time download links. Files are automatically deleted after use, ensuring privacy and security.

## Features

- 🔒 **Secure & Private**: Files are automatically deleted after one download
- ⚡ **Lightning Fast**: Optimized for speed and performance
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🛡️ **Rate Limited**: Built-in protection against abuse
- 🎨 **Modern UI**: Beautiful, minimalistic design with gradients and animations
- 🔐 **File Type Validation**: Only safe file types are allowed
- 📏 **Size Limits**: 50MB maximum file size

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Deployment**: Vercel
- **Security**: File validation, rate limiting, automatic cleanup

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd one-shot
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Deploy with default settings

The app is configured for Vercel deployment with:
- Serverless functions for API routes
- Automatic HTTPS
- Global CDN
- Security headers

## Security Features

- **One-time use**: Files are deleted immediately after download
- **File type validation**: Only safe file types are allowed
- **Size limits**: 50MB maximum file size
- **Rate limiting**: 10 uploads per 15 minutes per IP
- **Automatic cleanup**: Files expire after 1 hour
- **No data collection**: No personal information is stored
- **HTTPS encryption**: All transfers are encrypted

## API Endpoints

### POST /api/upload
Upload a file and get a download link.

**Request**: Multipart form data with `file` field
**Response**: 
```json
{
  "success": true,
  "fileId": "uuid",
  "downloadUrl": "/api/download/uuid",
  "expiresIn": "1 hour"
}
```

### GET /api/download/[fileId]
Download a file (one-time use).

**Response**: File download with appropriate headers

## File Types Supported

- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, TXT, CSV, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Archives: ZIP, RAR, 7Z
- Media: MP4, AVI, MOV, WMV, MP3, WAV, OGG, M4A

## Rate Limiting

- 10 uploads per 15 minutes per IP address
- 50MB maximum file size
- Files expire after 1 hour

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please open an issue on GitHub.
