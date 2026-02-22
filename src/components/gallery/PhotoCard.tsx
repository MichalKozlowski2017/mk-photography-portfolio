"use client";

import Image from "next/image";
import Link from "next/link";
import type { PhotoWithExif } from "@/types";
import { useLang } from "@/i18n/LangContext";

interface PhotoCardProps {
  photo: PhotoWithExif;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const { t } = useLang();
  return (
    <Link
      href={`/gallery/${photo.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden bg-zinc-900"
    >
      <Image
        src={photo.thumbnailUrl}
        alt={photo.title ?? t.photo.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {/* Title on hover */}
      {(photo.title || photo.category) && (
        <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {photo.title && <p className="text-sm font-medium text-white">{photo.title}</p>}
          {photo.category && (
            <p className="mt-0.5 text-[11px] tracking-[0.15em] uppercase text-white/60">
              {photo.category.name}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
