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
