"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PhotoCard } from "./PhotoCard";
import type { PhotoWithExif } from "@/types";
import { useLang } from "@/i18n/LangContext";
import { fetchGalleryPhotos } from "@/app/actions/photos";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";

type SortOption = "dateDesc" | "dateAsc" | "uploadDesc" | "ratingDesc";

interface PhotoGridProps {
  initialPhotos: PhotoWithExif[];
  initialHasMore: boolean;
  category?: string;
  sort: SortOption;
}

export function PhotoGrid({ initialPhotos, initialHasMore, category, sort }: PhotoGridProps) {
  const { t } = useLang();
  const [photos, setPhotos] = useState<PhotoWithExif[]>(initialPhotos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(1); // page 0 already loaded as initialPhotos
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when sort/category changes (new navigation)
  useEffect(() => {
    setPhotos(initialPhotos);
    setHasMore(initialHasMore);
    pageRef.current = 1;
  }, [initialPhotos, initialHasMore, sort, category]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const { photos: next, hasMore: more } = await fetchGalleryPhotos({
        page: pageRef.current,
        category,
        sort,
      });
      setPhotos((prev) => [...prev, ...next]);
      setHasMore(more);
      pageRef.current += 1;
    } catch (err) {
      console.error("[PhotoGrid] loadMore error", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, category, sort]);

  // Intersection Observer — fires when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (photos.length === 0 && !isLoading) {
    return <p className="py-16 text-center text-muted-foreground">{t.photoGrid.empty}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      {/* Sentinel + status */}
      <div ref={sentinelRef} className="mt-10 flex items-center justify-center py-4">
        {isLoading && (
          <span className="flex items-center gap-3 text-sm tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent dark:border-zinc-500 dark:border-t-transparent" />
            {t.photoGrid.loadingMore}
          </span>
        )}
        {!isLoading && !hasMore && photos.length >= GALLERY_PAGE_SIZE && (
          <span className="text-xs tracking-[0.2em] uppercase text-zinc-300 dark:text-zinc-600">
            {t.photoGrid.noMore}
          </span>
        )}
      </div>
    </div>
  );
}
