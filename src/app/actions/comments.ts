"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitComment(
  photoId: string,
  authorName: string,
  content: string,
): Promise<{ success?: true; error?: string }> {
  if (!authorName.trim() || !content.trim()) {
    return { error: "All fields are required." };
  }
  if (authorName.length > 100) return { error: "Name is too long." };
  if (content.length > 1000) return { error: "Comment is too long." };

  try {
    await prisma.comment.create({
      data: {
        photoId,
        authorName: authorName.trim(),
        content: content.trim(),
        approved: false,
      },
    });
    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function approveComment(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  await prisma.comment.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/comments");
}

export async function deleteComment(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  await prisma.comment.delete({ where: { id } });
  revalidatePath("/admin/comments");
}
