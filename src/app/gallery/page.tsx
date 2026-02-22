import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { getT } from "@/i18n/server";
import type { PhotoWithExif } from "@/types";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function GalleryPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const [photos, categories, t] = await Promise.all([
    prisma.photo.findMany({
      where: {
        published: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { exif: true, category: true },
    }),
    prisma.category.findMany({
      where: { photos: { some: { published: true } } },
      orderBy: { name: "asc" },
    }),
    getT(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-32">
      <h1 className="mb-10 text-center font-playfair text-4xl tracking-[0.15em] text-white">
        {t.gallery.title}
      </h1>

      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/gallery"
            className={`border px-5 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors ${
              !category
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
            }`}
          >
            {t.gallery.all}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/gallery?category=${cat.slug}`}
              className={`border px-5 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors ${
                category === cat.slug
                  ? "border-white bg-white text-black"
                  : "border-white/20 text-white/50 hover:border-white/60 hover:text-white"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <PhotoGrid photos={photos as PhotoWithExif[]} />
    </main>
  );
}
