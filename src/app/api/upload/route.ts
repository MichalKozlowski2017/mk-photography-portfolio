import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { processUpload } from "@/lib/upload";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils/photo";

export const dynamic = "force-dynamic";

/**
 * Returns a slug that doesn't already exist in the DB.
 * If `base` is taken, tries base-2, base-3 … up to base-99, then falls back to base-{timestamp}.
 */
async function uniqueSlug(base: string): Promise<string> {
  const exists = await prisma.photo.findUnique({ where: { slug: base }, select: { id: true } });
  if (!exists) return base;
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    const taken = await prisma.photo.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const categoryId = formData.get("categoryId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { filename, url, thumbnailUrl, width, height, exif } = await processUpload(
      buffer,
      file.name,
    );

    const slug = await uniqueSlug(generateSlug(title ?? filename));

    const photo = await prisma.photo.create({
      data: {
        title: title || null,
        description: description || null,
        slug,
        filename,
        url,
        thumbnailUrl,
        width,
        height,
        categoryId: categoryId || null,
        exif: {
          create: {
            cameraMake: exif.cameraMake ?? null,
            cameraModel: exif.cameraModel ?? null,
            lens: exif.lens ?? null,
            focalLength: exif.focalLength ?? null,
            aperture: exif.aperture ?? null,
            exposureTime: exif.exposureTime ?? null,
            iso: exif.iso ?? null,
            takenAt: exif.takenAt ?? null,
            latitude: exif.latitude ?? null,
            longitude: exif.longitude ?? null,
          },
        },
      },
      include: { exif: true, category: true },
    });

    return NextResponse.json({ success: true, photo });
  } catch (err: any) {
    console.error("[upload] error:", err);
    // Prisma unique constraint
    if (err?.code === "P2002") {
      const field = (err?.meta?.target as string[] | undefined)?.[0] ?? "pola";
      return NextResponse.json(
        { error: `Zdjęcie z tym samym ${field} już istnieje. Zmień tytuł i spróbuj ponownie.` },
        { status: 409 },
      );
    }
    const message = err instanceof Error ? err.message : "Wewnętrzny błąd serwera";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
