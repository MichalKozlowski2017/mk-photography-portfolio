import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dodaj zdjęcie</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Strona główna
          </Link>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Panel
          </Link>
        </div>
      </div>
      <UploadForm categories={categories} />
    </div>
  );
}
