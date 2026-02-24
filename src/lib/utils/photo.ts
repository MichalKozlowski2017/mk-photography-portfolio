/**
 * Generates a URL-friendly slug from a string.
 * If no title is provided, falls back to a timestamp-based slug.
 */
export function generateSlug(text?: string | null): string {
  if (text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  }
  return `photo-${Date.now()}`;
}

/**
 * Formats aperture f/2.8 etc.
 */
export function formatAperture(value?: number | null): string | null {
  if (!value) return null;
  return `f/${value.toFixed(1)}`;
}

/**
 * Formats focal length e.g. 50mm
 */
export function formatFocalLength(value?: number | null): string | null {
  if (!value) return null;
  return `${Math.round(value)}mm`;
}

/** Known raw make+model → friendly display name */
const CAMERA_NAME_MAP: Record<string, string> = {
  "NIKON CORPORATION|NIKON Z 6_2": "Nikon Z6 II",
  "NIKON CORPORATION|NIKON Z 7_2": "Nikon Z7 II",
  "OLYMPUS CORPORATION|E-M1MarkIII": "Olympus E-M1 Mark III",
  "OLYMPUS CORPORATION|E-M1MarkII": "Olympus E-M1 Mark II",
  "OLYMPUS CORPORATION|E-M5MarkIII": "Olympus E-M5 Mark III",
  "OLYMPUS CORPORATION|E-M5MarkII": "Olympus E-M5 Mark II",
};

/** Known raw model-only → friendly display name (for stats queries that don't include make) */
const CAMERA_MODEL_MAP: Record<string, string> = {
  "NIKON Z 6_2": "Nikon Z6 II",
  "NIKON Z 7_2": "Nikon Z7 II",
  "E-M1MarkIII": "Olympus E-M1 Mark III",
  "E-M1MarkII": "Olympus E-M1 Mark II",
  "E-M5MarkIII": "Olympus E-M5 Mark III",
  "E-M5MarkII": "Olympus E-M5 Mark II",
};

/**
 * Returns a friendly camera name from raw EXIF make + model strings.
 * Falls back to a simple joined string if no mapping is found.
 */
export function normalizeCameraName(make?: string | null, model?: string | null): string | null {
  if (!make && !model) return null;
  const key = `${(make ?? "").trim()}|${(model ?? "").trim()}`;
  if (CAMERA_NAME_MAP[key]) return CAMERA_NAME_MAP[key];
  // Generic cleanup: remove redundant make prefix from model string
  const cleanMake = (make ?? "").trim();
  const cleanModel = (model ?? "").trim();
  if (cleanModel.toUpperCase().startsWith(cleanMake.toUpperCase())) {
    return cleanModel || null;
  }
  return [cleanMake, cleanModel].filter(Boolean).join(" ") || null;
}

/**
 * Returns a friendly camera name from a raw EXIF model string only
 * (used in stats queries that don't include the make column).
 */
export function normalizeCameraModel(model?: string | null): string | null {
  if (!model) return null;
  return CAMERA_MODEL_MAP[model.trim()] ?? model.trim();
}
