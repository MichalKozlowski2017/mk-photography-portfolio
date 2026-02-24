"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

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
