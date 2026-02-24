import exifr from "exifr";

export interface ParsedExif {
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  exposureTime?: string;
  iso?: number;
  takenAt?: Date;
  latitude?: number;
  longitude?: number;
}

/**
 * Formats exposure time to human-readable fraction e.g. 0.002 → "1/500"
 */
function formatExposureTime(value: number): string {
  if (value >= 1) return `${value}s`;
  const denominator = Math.round(1 / value);
  return `1/${denominator}`;
}

/**
 * Extracts EXIF metadata from a file buffer or path.
 */
export async function extractExif(source: Buffer | string): Promise<ParsedExif> {
  try {
    const raw = await exifr.parse(source, {
      tiff: true,
      exif: true,
      gps: true,
      ifd1: false,
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
        "latitude",
        "longitude",
      ],
    });

    if (!raw) return {};

    return {
      cameraMake: raw.Make?.trim() ?? undefined,
      cameraModel: raw.Model?.trim() ?? undefined,
      lens: raw.LensModel ?? undefined,
      focalLength: raw.FocalLength ?? undefined,
      aperture: raw.FNumber ?? undefined,
      exposureTime: raw.ExposureTime ? formatExposureTime(raw.ExposureTime) : undefined,
      iso: raw.ISO ?? undefined,
      takenAt: raw.DateTimeOriginal ? new Date(raw.DateTimeOriginal) : undefined,
      latitude: raw.latitude ?? undefined,
      longitude: raw.longitude ?? undefined,
    };
  } catch (err) {
    console.error("EXIF extraction failed:", err);
    return {};
  }
}
