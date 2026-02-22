import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [photoCount, categoryCount] = await Promise.all([
    prisma.photo.count(),
    prisma.category.count(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel admina</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
            Wyloguj
          </button>
        </form>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Zdjęcia</p>
          <p className="mt-1 text-3xl font-bold">{photoCount}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Kategorie</p>
          <p className="mt-1 text-3xl font-bold">{categoryCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/photos/new"
          className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          + Dodaj zdjęcie
        </Link>
        <Link href="/admin/photos" className="rounded-lg border px-5 py-2.5 text-sm font-medium">
          Wszystkie zdjęcia
        </Link>
      </div>
    </div>
  );
}
