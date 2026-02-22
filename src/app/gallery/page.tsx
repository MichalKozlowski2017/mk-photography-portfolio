import { prisma } from "@/lib/prisma";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import type { PhotoWithExif } from "@/types";

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { exif: true, category: true },
  });

  const categories = await prisma.category.findMany({
    where: { photos: { some: { published: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Galeria</h1>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <span className="rounded-full border px-4 py-1.5 text-sm font-medium">Wszystkie</span>
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <PhotoGrid photos={photos as PhotoWithExif[]} />
    </main>
  );
}
