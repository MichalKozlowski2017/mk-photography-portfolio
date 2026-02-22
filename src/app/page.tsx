import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import type { PhotoWithExif } from "@/types";

export default async function Home() {
  const featured = await prisma.photo.findMany({
    where: { published: true, featured: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
    include: { exif: true, category: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">MK Photography</h1>
        <p className="mt-4 text-lg text-muted-foreground">Portfolio fotograficzne</p>
        <Link
          href="/gallery"
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background"
        >
          Zobacz galerię
        </Link>
      </section>

      {featured.length > 0 ? (
        <section>
          <h2 className="mb-6 text-2xl font-semibold">Wyróżnione zdjęcia</h2>
          <PhotoGrid photos={featured as PhotoWithExif[]} />
        </section>
      ) : (
        <section className="rounded-xl border border-dashed py-24 text-center">
          <p className="text-muted-foreground">
            Galeria jest pusta. Dodaj pierwsze zdjęcia w{" "}
            <Link href="/admin" className="underline">
              panelu admina
            </Link>
            .
          </p>
        </section>
      )}
    </main>
  );
}
