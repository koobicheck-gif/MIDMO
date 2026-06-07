import { NextRequest, NextResponse } from 'next/server'
import { requireRole, handleApiError, successResponse } from '@/lib/api-helpers'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i

export async function POST(request: NextRequest) {
  const { error } = await requireRole(['OWNER', 'OFFICE'], request)
  if (error) return error

  try {
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type by MIME and extension
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
        { status: 415 }
      )
    }
    if (!ALLOWED_EXTENSIONS.test(file.name)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 415 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File must be under ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      )
    }

    // Verify actual file bytes start with a known image signature (magic bytes check)
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    if (!isValidImageBytes(bytes)) {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 415 })
    }

    // Upload to Cloudinary
    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const base64 = Buffer.from(buffer).toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'midmo',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })

    return successResponse({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/** Check magic bytes to confirm file is actually an image, not a disguised script */
function isValidImageBytes(bytes: Uint8Array): boolean {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true
  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true
  return false
}
