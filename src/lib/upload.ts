import sharp from "sharp";
import { extractExif, type ParsedExif } from "./exif";
import { cloudinary, CLOUDINARY_FOLDER } from "./cloudinary";

const THUMBNAIL_WIDTH = 600;
const WEB_MAX_WIDTH = 2400;
// Cloudinary free plan limit is 10 MB — pre-compress to stay safely under it
const UPLOAD_MAX_PX = 4000;
const UPLOAD_JPEG_QUALITY = 88;

export interface UploadResult {
  filename: string; // Cloudinary public_id
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  exif: ParsedExif;
}

/**
 * Generates a slug-friendly public_id for Cloudinary.
 */
function generatePublicId(originalName: string): string {
  const base = originalName
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .slice(0, 40);
  return `${CLOUDINARY_FOLDER}/${Date.now()}-${base}`;
}

/**
 * Builds a Cloudinary thumbnail URL using URL-based transformations.
 * No extra upload needed — Cloudinary generates it on-the-fly and caches it.
 */
function buildThumbnailUrl(secureUrl: string): string {
  // Insert transformation before /upload/
  // e.g. https://res.cloudinary.com/cloud/image/upload/v123/folder/img.jpg
  //   -> https://res.cloudinary.com/cloud/image/upload/w_600,c_limit,q_80,f_webp/v123/folder/img.jpg
  return secureUrl.replace("/upload/", `/upload/w_${THUMBNAIL_WIDTH},c_limit,q_80,f_webp/`);
}

/**
 * Processes an uploaded file: extracts EXIF, reads dimensions,
 * uploads to Cloudinary. Returns URLs and metadata.
 */
export async function processUpload(buffer: Buffer, originalName: string): Promise<UploadResult> {
  // Extract EXIF from raw buffer before any processing
  const exif = await extractExif(buffer);

  // Read original dimensions
  const metadata = await sharp(buffer).metadata();
  const origWidth = metadata.width ?? 0;
  const origHeight = metadata.height ?? 0;

  // Pre-compress to JPEG so the upload stays under Cloudinary's 10 MB free-plan limit.
  // Resizes only if either dimension exceeds UPLOAD_MAX_PX; otherwise just re-encodes.
  const uploadBuffer = await sharp(buffer)
    .rotate() // auto-orient from EXIF
    .resize({
      width: UPLOAD_MAX_PX,
      height: UPLOAD_MAX_PX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: UPLOAD_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  const publicId = generatePublicId(originalName);

  // Upload to Cloudinary — store original, rely on URL transforms for resizing
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${uploadBuffer.toString("base64")}`,
    {
      public_id: publicId,
      overwrite: false,
      resource_type: "image",
      // Eagerly generate the web-optimised version server-side
      eager: [{ width: WEB_MAX_WIDTH, crop: "limit", quality: 85, fetch_format: "webp" }],
      eager_async: false,
    },
  );

  // Use the eager version URL as the main display URL if available
  const mainUrl = (result.eager?.[0]?.secure_url as string | undefined) ?? result.secure_url;

  return {
    filename: result.public_id,
    url: mainUrl,
    thumbnailUrl: buildThumbnailUrl(result.secure_url),
    width: (origWidth || result.width) ?? 0,
    height: (origHeight || result.height) ?? 0,
    exif,
  };
}

/**
 * Deletes an image from Cloudinary by its public_id.
 */
export async function deleteUpload(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
