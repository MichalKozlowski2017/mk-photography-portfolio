import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UploadForm } from "@/components/admin/UploadForm";

export default async function NewPhotoPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">Dodaj zdjęcie</h1>
      <UploadForm categories={categories} />
    </div>
  );
}
