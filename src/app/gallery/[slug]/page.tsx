import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExifPanel } from "@/components/exif/ExifPanel";
import type { PhotoWithExif } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PhotoPage({ params }: Props) {
  const { slug } = await params;

  const photo = await prisma.photo.findUnique({
    where: { slug, published: true },
    include: { exif: true, category: true },
  });

  if (!photo) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Link
        href="/gallery"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Wróć do galerii
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Photo */}
        <div className="relative overflow-hidden rounded-xl bg-muted">
          <Image
            src={photo.url}
            alt={photo.title ?? "Zdjęcie"}
            width={photo.width}
            height={photo.height}
            className="w-full object-contain"
            priority
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {photo.title && <h1 className="text-2xl font-bold">{photo.title}</h1>}
          {photo.description && <p className="text-muted-foreground">{photo.description}</p>}
          {photo.category && (
            <span className="inline-block w-fit rounded-full border px-3 py-1 text-xs font-medium">
              {photo.category.name}
            </span>
          )}
          <ExifPanel exif={photo.exif as PhotoWithExif["exif"]} />
        </div>
      </div>
    </main>
  );
}
