import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addCategory } from "@/app/actions/categories";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

async function addCategoryAction(formData: FormData) {
  "use server";
  await addCategory(formData);
}

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategorie ({categories.length})</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Strona główna
          </Link>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Panel
          </Link>
        </div>
      </div>

      {/* Add form */}
      <form action={addCategoryAction} className="mb-8 flex gap-3 rounded-lg border p-4">
        <input
          type="text"
          name="name"
          required
          placeholder="Nazwa nowej kategorii…"
          className="flex-1 rounded border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background"
        >
          + Dodaj
        </button>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nazwa</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-center font-medium">Zdjęcia</th>
              <th className="px-4 py-3 text-right font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {cat._count.photos > 0 ? (
                    <Link
                      href={`/gallery?category=${cat.slug}`}
                      target="_blank"
                      className="hover:underline"
                    >
                      {cat._count.photos}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground/50">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteCategoryButton
                    id={cat.id}
                    name={cat.name}
                    photoCount={cat._count.photos}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
