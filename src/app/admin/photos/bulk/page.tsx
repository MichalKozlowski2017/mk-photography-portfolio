import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BulkUploadForm } from "@/components/admin/BulkUploadForm";

export default async function BulkUploadPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Masowy upload zdjęć</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tytuły generowane automatycznie z daty EXIF
          </p>
        </div>
        <Link href="/admin/photos" className="text-sm text-muted-foreground hover:text-foreground">
          ← Wszystkie zdjęcia
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Strona główna
        </Link>
      </div>
      <BulkUploadForm categories={categories} />
    </div>
  );
}
