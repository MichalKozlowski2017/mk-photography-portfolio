import { prisma } from "@/lib/prisma";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { getT } from "@/i18n/server";
import type { PhotoWithExif } from "@/types";

export default async function Home() {
  const [photos, t] = await Promise.all([
    prisma.photo.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { exif: true, category: true },
    }),
    getT(),
  ]);

  const heroPhotos = photos.slice(0, 5).map((p) => ({ url: p.url, title: p.title }));

  return (
    <>
      <HeroSlider photos={heroPhotos} />

      {photos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="mb-12 text-center font-playfair text-3xl tracking-[0.15em] text-white">
            {t.home.latestWork}
          </h2>
          <PhotoGrid photos={photos as PhotoWithExif[]} />
        </section>
      )}
    </>
  );
}
