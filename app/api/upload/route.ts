import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB limit

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

function getUploadsDirectory() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = getUploadsDirectory();

    let buffer: Buffer | null = null;
    let originalName = 'upload';
    let mimeType = 'application/octet-stream';
    let fileSize = 0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File size exceeds 2 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please compress your file.`,
          },
          { status: 400 }
        );
      }

      originalName = file.name || 'upload';
      mimeType = file.type || 'application/octet-stream';
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      const { dataUrl, name, type } = body || {};

      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json({ success: false, error: 'Invalid data URL.' }, { status: 400 });
      }

      const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) {
        return NextResponse.json({ success: false, error: 'Malformed base64 data URL.' }, { status: 400 });
      }

      mimeType = match[1] || type || 'application/octet-stream';
      const base64Content = match[2];
      buffer = Buffer.from(base64Content, 'base64');
      fileSize = buffer.length;
      originalName = name || 'upload';

      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File size exceeds 2 MB limit (${(fileSize / (1024 * 1024)).toFixed(2)} MB). Please compress your file.`,
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ success: false, error: 'File content is empty.' }, { status: 400 });
    }

    // Determine safe file extension
    let ext = path.extname(originalName).toLowerCase();
    if (!ext || ext.length < 2) {
      ext = MIME_EXTENSION_MAP[mimeType.toLowerCase()] || '.bin';
    }

    // Generate unique content-addressed filename
    const hash = crypto.randomBytes(12).toString('hex');
    const timestamp = Date.now();
    const cleanBaseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const finalFileName = `${timestamp}_${hash}_${cleanBaseName}${ext}`;
    const destinationPath = path.join(uploadsDir, finalFileName);

    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${finalFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize,
      fileType: mimeType,
    });
  } catch (err: any) {
    console.error('[Upload API Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to upload file to storage.' },
      { status: 500 }
    );
  }
}
