import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { DeletePhotoButton } from "@/components/admin/DeletePhotoButton";

export default async function AdminPhotosPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zdjęcia ({photos.length})</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Strona główna
          </Link>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Panel
          </Link>
          <div className="flex gap-3">
            <Link
              href="/admin/photos/bulk"
              className="rounded-lg border px-5 py-2.5 text-sm font-medium"
            >
              ↑ Masowy upload
            </Link>
            <Link
              href="/admin/photos/new"
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background"
            >
              + Dodaj zdjęcie
            </Link>
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">Brak zdjęć. Dodaj pierwsze!</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Zdjęcie</th>
                <th className="px-4 py-3 text-left font-medium">Tytuł</th>
                <th className="px-4 py-3 text-left font-medium">Kategoria</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {photos.map((photo) => (
                <tr key={photo.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded">
                      <Image
                        src={photo.thumbnailUrl}
                        alt={photo.title ?? ""}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/gallery/${photo.slug}`} className="font-medium hover:underline">
                      {photo.title ?? photo.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{photo.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        photo.published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {photo.published ? "Opublikowane" : "Ukryte"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(photo.createdAt).toLocaleDateString("pl-PL")}
                  </td>
                  <td className="px-4 py-3">
                    <DeletePhotoButton photoId={photo.id} photoTitle={photo.title ?? photo.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
