import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { extractExif, type ParsedExif } from "./exif";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMBNAIL_SUFFIX = "_thumb";
const THUMBNAIL_WIDTH = 600;
const WEB_MAX_WIDTH = 2400;

export interface UploadResult {
  filename: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  exif: ParsedExif;
}

/**
 * Ensures the uploads directory exists.
 */
async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Generates a unique filename based on original name + timestamp.
 */
function generateFilename(originalName: string, suffix = ""): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .slice(0, 40);
  const timestamp = Date.now();
  return `${timestamp}-${base}${suffix}.webp`;
}

/**
 * Processes an uploaded file: converts to WebP, generates thumbnail,
 * extracts EXIF. Returns URLs and metadata.
 */
export async function processUpload(buffer: Buffer, originalName: string): Promise<UploadResult> {
  await ensureUploadDir();

  const filename = generateFilename(originalName);
  const thumbFilename = generateFilename(originalName, THUMBNAIL_SUFFIX);

  const filePath = path.join(UPLOAD_DIR, filename);
  const thumbPath = path.join(UPLOAD_DIR, thumbFilename);

  // Extract EXIF before any lossy processing
  const exif = await extractExif(buffer);

  // Process main image
  const image = sharp(buffer);
  const metadata = await image.metadata();

  await image
    .resize({ width: WEB_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(filePath);

  // Process thumbnail
  await sharp(buffer)
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  return {
    filename,
    url: `/uploads/${filename}`,
    thumbnailUrl: `/uploads/${thumbFilename}`,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    exif,
  };
}

/**
 * Deletes image files from disk.
 */
export async function deleteUpload(filename: string, thumbFilename: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, filename);
  const thumbPath = path.join(UPLOAD_DIR, thumbFilename);

  await Promise.allSettled([fs.unlink(filePath), fs.unlink(thumbPath)]);
}
