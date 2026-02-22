"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function submitRating(photoId: string, value: number) {
  if (value < 1 || value > 5) return;

  const store = await cookies();
  let sessionId = store.get("rating_session")?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    store.set("rating_session", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 5, // 5 years
      sameSite: "lax",
      httpOnly: true,
    });
  }

  await prisma.rating.upsert({
    where: { photoId_sessionId: { photoId, sessionId } },
    update: { value },
    create: { photoId, sessionId, value },
  });

  revalidatePath(`/gallery`);
}
