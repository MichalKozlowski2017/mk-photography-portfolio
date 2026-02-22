export interface ExifData {
  cameraMake?: string | null;
  cameraModel?: string | null;
  lens?: string | null;
  focalLength?: number | null;
  aperture?: number | null;
  exposureTime?: string | null;
  iso?: number | null;
  takenAt?: Date | string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PhotoWithExif {
  id: string;
  title: string | null;
  description: string | null;
  slug: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  exif: ExifData | null;
}
