import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { SortSelect, type SortOption, DEFAULT_SORT } from "@/components/gallery/SortSelect";
import { getT } from "@/i18n/server";
import type { PhotoWithExif } from "@/types";

interface Props {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

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

export default async function GalleryPage({ searchParams }: Props) {
  const { category, sort: sortParam } = await searchParams;
  const sort: SortOption =
    sortParam && ["dateDesc", "dateAsc", "uploadDesc", "ratingDesc"].includes(sortParam)
      ? (sortParam as SortOption)
      : DEFAULT_SORT;

  const where = {
    published: true,
    ...(category ? { category: { slug: category } } : {}),
  };

  const [photos, categories, t, ratingAggregates] = await Promise.all([
    prisma.photo.findMany({
      where,
      orderBy: sort === "ratingDesc" ? [{ createdAt: "desc" }] : getOrderBy(sort),
      include: { exif: true, category: true },
    }),
    prisma.category.findMany({
      where: { photos: { some: { published: true } } },
      orderBy: { name: "asc" },
    }),
    getT(),
    sort === "ratingDesc"
      ? prisma.rating.groupBy({
          by: ["photoId"],
          _avg: { value: true },
        })
      : Promise.resolve(null),
  ]);

  let sortedPhotos = photos as PhotoWithExif[];
  if (sort === "ratingDesc" && ratingAggregates) {
    const avgMap = new Map(ratingAggregates.map((r) => [r.photoId, r._avg.value ?? 0]));
    sortedPhotos = [...sortedPhotos].sort(
      (a, b) => (avgMap.get(b.id) ?? 0) - (avgMap.get(a.id) ?? 0),
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-32">
      <h1 className="mb-10 text-center font-playfair text-4xl tracking-[0.15em] text-zinc-900 dark:text-white">
        {t.gallery.title}
      </h1>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Link
            href={sort !== DEFAULT_SORT ? `/gallery?sort=${sort}` : "/gallery"}
            className={`border px-5 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors ${
              !category
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-300 text-zinc-400 hover:border-zinc-600 hover:text-zinc-700 dark:border-white/20 dark:text-white/50 dark:hover:border-white/60 dark:hover:text-white"
            }`}
          >
            {t.gallery.all}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/gallery?category=${cat.slug}${sort !== DEFAULT_SORT ? `&sort=${sort}` : ""}`}
              className={`border px-5 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors ${
                category === cat.slug
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-300 text-zinc-400 hover:border-zinc-600 hover:text-zinc-700 dark:border-white/20 dark:text-white/50 dark:hover:border-white/60 dark:hover:text-white"
              }`}
            >
              {t.categories[cat.slug] ?? cat.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-8 flex justify-center">
        <Suspense fallback={null}>
          <SortSelect current={sort} />
        </Suspense>
      </div>

      <PhotoGrid photos={sortedPhotos} />
    </main>
  );
}
