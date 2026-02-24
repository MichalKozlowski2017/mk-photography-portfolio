"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function addCategory(formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session) return { error: "Brak autoryzacji" };

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "Nazwa jest wymagana" };

  const slug = toSlug(name);
  if (!slug) return { error: "Nie można wygenerować slug z tej nazwy" };

  try {
    await prisma.category.create({ data: { name, slug } });
  } catch (err: any) {
    if (err?.code === "P2002") return { error: "Kategoria z tą nazwą już istnieje" };
    return { error: "Błąd bazy danych" };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/gallery");
  return {};
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session) return { error: "Brak autoryzacji" };

  const count = await prisma.photo.count({ where: { categoryId: id } });
  if (count > 0)
    return {
      error: `Nie można usunąć — kategoria ma ${count} ${count === 1 ? "zdjęcie" : "zdjęcia/zdjęć"}`,
    };

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  revalidatePath("/gallery");
  return {};
}
