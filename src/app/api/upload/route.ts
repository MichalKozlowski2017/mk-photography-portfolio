import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { processUpload } from "@/lib/upload";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils/photo";

export const dynamic = "force-dynamic";

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

  const { filename, url, thumbnailUrl, width, height, exif } = await processUpload(
    buffer,
    file.name,
  );

  const slug = generateSlug(title ?? filename);

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
}
