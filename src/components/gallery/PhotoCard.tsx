"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PhotoWithExif } from "@/types";
import { useLang } from "@/i18n/LangContext";

interface PhotoCardProps {
  photo: PhotoWithExif;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={`/gallery/${photo.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
    >
      {/* Spinner — visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
        </div>
      )}

      <Image
        src={photo.thumbnailUrl}
        alt={photo.title ?? t.photo.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover transition duration-700 ease-out group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {/* Date badge — always visible */}
      {photo.exif?.takenAt && (
        <div className="absolute right-2 top-2 bg-black/60 px-2 py-0.5 text-[10px] tracking-[0.1em] text-white/70 backdrop-blur-sm">
          {new Date(photo.exif.takenAt).toLocaleDateString(t.exif.dateLocale, {
            year: "numeric",
            month: "short",
          })}
        </div>
      )}
      {/* Title on hover */}
      {(photo.title || photo.category) && (
        <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {photo.title && <p className="text-sm font-medium text-white">{photo.title}</p>}
          {photo.category && (
            <p className="mt-0.5 text-[11px] tracking-[0.15em] uppercase text-white/60">
              {t.categories[photo.category.slug] ?? photo.category.name}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
