import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';

// Configure multer for image uploads
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Generate unique filename
export function generateImageFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}_${nanoid(8)}${ext}`;
}

// Convert buffer to base64 data URL
export function bufferToDataUrl(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}