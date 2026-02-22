import Image from "next/image";
import Link from "next/link";
import type { PhotoWithExif } from "@/types";

interface PhotoCardProps {
  photo: PhotoWithExif;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <Link
      href={`/gallery/${photo.slug}`}
      className="group block overflow-hidden rounded-lg bg-muted"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={photo.thumbnailUrl}
          alt={photo.title ?? "Zdjęcie"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      </div>
      {photo.title && (
        <div className="p-3">
          <p className="truncate text-sm font-medium">{photo.title}</p>
          {photo.category && (
            <p className="mt-0.5 text-xs text-muted-foreground">{photo.category.name}</p>
          )}
        </div>
      )}
    </Link>
  );
}
