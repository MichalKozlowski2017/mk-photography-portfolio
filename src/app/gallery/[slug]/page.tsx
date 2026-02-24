import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ExifPanel } from "@/components/exif/ExifPanel";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { StarRating } from "@/components/ratings/StarRating";
import { getT } from "@/i18n/server";
import type { PhotoWithExif } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PhotoPage({ params }: Props) {
  const { slug } = await params;

  const sessionId = (await cookies()).get("rating_session")?.value ?? null;

  const [photo, t, ratingData, userRatingRecord] = await Promise.all([
    prisma.photo.findUnique({
      where: { slug, published: true },
      include: {
        exif: true,
        category: true,
        comments: {
          where: { approved: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, authorName: true, content: true, createdAt: true },
        },
      },
    }),
    getT(),
    prisma.rating.aggregate({
      where: { photo: { slug } },
      _avg: { value: true },
      _count: { value: true },
    }),
    sessionId
      ? prisma.rating.findFirst({ where: { photo: { slug }, sessionId } })
      : Promise.resolve(null),
  ]);

  if (!photo) notFound();

  const averageRating = ratingData._avg.value;
  const ratingCount = ratingData._count.value;
  const userRating = userRatingRecord?.value ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-32">
      <Link
        href="/gallery"
        className="mb-10 inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/40 transition-colors hover:text-white"
      >
        {t.photo.back}
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
        {/* Photo */}
        <div className="overflow-hidden bg-zinc-900">
          <Image
            src={photo.url}
            alt={photo.title ?? t.photo.alt}
            width={photo.width}
            height={photo.height}
            className="w-full object-contain"
            priority
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {photo.title && (
            <h1 className="font-playfair text-2xl font-bold text-white">{photo.title}</h1>
          )}
          {photo.description && (
            <p className="text-sm leading-relaxed text-white/60">{photo.description}</p>
          )}
          {photo.category && (
            <span className="inline-block w-fit border border-white/20 px-3 py-1 text-[11px] tracking-[0.2em] uppercase text-white/50">
              {t.categories[photo.category.slug] ?? photo.category.name}
            </span>
          )}
          {photo.exif?.takenAt && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="text-[11px] tracking-[0.2em] uppercase text-white/30">
                {t.exif.date}
              </span>
              <span>
                {new Date(photo.exif.takenAt).toLocaleDateString(t.exif.dateLocale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          <ExifPanel exif={photo.exif as PhotoWithExif["exif"]} />

          {/* Star rating */}
          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-[11px] tracking-[0.2em] uppercase text-white/30">
              {t.rating.title}
            </p>
            <StarRating
              photoId={photo.id}
              averageRating={averageRating}
              ratingCount={ratingCount}
              userRating={userRating}
            />
          </div>
        </div>
      </div>

      {/* Comments */}
      <section className="mx-auto mt-16 max-w-2xl border-t border-white/10 pt-12">
        <h2 className="mb-8 text-sm tracking-[0.25em] uppercase text-white/40">
          {t.comments.title}
          {photo.comments.length > 0 && (
            <span className="ml-2 text-white/20">({photo.comments.length})</span>
          )}
        </h2>
        <div className="mb-10">
          <CommentList comments={photo.comments} />
        </div>
        <CommentForm photoId={photo.id} />
      </section>
    </main>
  );
}
