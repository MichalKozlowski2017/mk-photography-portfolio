"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import type { PhotoWithExif } from "@/types";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";

type SortOption = "dateDesc" | "dateAsc" | "uploadDesc" | "ratingDesc";

function getOrderBy(sort: SortOption) {
  switch (sort) {
    case "dateAsc":
      return [{ exif: { takenAt: "asc" } }, { createdAt: "asc" }] as const;
    case "uploadDesc":
      return [{ createdAt: "desc" }] as const;
    case "dateDesc":
    default:
      return [{ exif: { takenAt: "desc" } }, { createdAt: "desc" }] as const;
  }
}

export async function fetchGalleryPhotos({
  page,
  category,
  sort,
}: {
  page: number;
  category?: string;
  sort: SortOption;
}): Promise<{ photos: PhotoWithExif[]; hasMore: boolean }> {
  const where = {
    published: true,
    ...(category ? { category: { slug: category } } : {}),
  };

  if (sort === "ratingDesc") {
    // Fetch all with rating aggregates, then sort and slice
    const [allPhotos, ratingAggregates] = await Promise.all([
      prisma.photo.findMany({
        where,
        include: { exif: true, category: true },
      }),
      prisma.rating.groupBy({ by: ["photoId"], _avg: { value: true } }),
    ]);
    const avgMap = new Map(ratingAggregates.map((r) => [r.photoId, r._avg.value ?? 0]));
    const sorted = (allPhotos as PhotoWithExif[]).sort(
      (a, b) => (avgMap.get(b.id) ?? 0) - (avgMap.get(a.id) ?? 0),
    );
    const start = page * GALLERY_PAGE_SIZE;
    return {
      photos: sorted.slice(start, start + GALLERY_PAGE_SIZE),
      hasMore: start + GALLERY_PAGE_SIZE < sorted.length,
    };
  }

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip: page * GALLERY_PAGE_SIZE,
      take: GALLERY_PAGE_SIZE,
      include: { exif: true, category: true },
    }),
    prisma.photo.count({ where }),
  ]);

  return {
    photos: photos as PhotoWithExif[],
    hasMore: page * GALLERY_PAGE_SIZE + photos.length < total,
  };
}

function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

export async function deletePhoto(photoId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session) return { error: "Brak autoryzacji" };

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return { error: "Zdjęcie nie istnieje" };

  // Usuń z Cloudinary
  const publicId = extractPublicId(photo.url);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("[deletePhoto] Cloudinary error:", err);
      // Kontynuuj nawet jeśli Cloudinary zwróci błąd
    }
  }

  // Usuń z bazy (CASCADE usuwa exif, comments, ratings)
  await prisma.photo.delete({ where: { id: photoId } });

  revalidatePath("/admin/photos");
  revalidatePath("/gallery");
  revalidatePath("/");

  return {};
}
