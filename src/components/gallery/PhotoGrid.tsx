"use client";

import { PhotoCard } from "./PhotoCard";
import type { PhotoWithExif } from "@/types";
import { useLang } from "@/i18n/LangContext";

interface PhotoGridProps {
  photos: PhotoWithExif[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const { t } = useLang();
  if (photos.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">{t.photoGrid.empty}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
