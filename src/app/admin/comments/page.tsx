import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { approveComment, deleteComment } from "@/app/actions/comments";

export default async function AdminCommentsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [pending, approved] = await Promise.all([
    prisma.comment.findMany({
      where: { approved: false },
      orderBy: { createdAt: "asc" },
      include: { photo: { select: { title: true, slug: true } } },
    }),
    prisma.comment.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      include: { photo: { select: { title: true, slug: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Komentarze</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Strona główna
          </Link>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Panel
          </Link>
        </div>
      </div>

      {/* Pending */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm tracking-[0.2em] uppercase text-muted-foreground">
          Oczekujące ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Brak oczekujących komentarzy.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium">{c.authorName}</span>
                    <span className="ml-3 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString("pl-PL")}
                    </span>
                    <span className="ml-3 text-xs text-muted-foreground">
                      →{" "}
                      <Link
                        href={`/gallery/${c.photo.slug}`}
                        className="hover:underline"
                        target="_blank"
                      >
                        {c.photo.title ?? c.photo.slug}
                      </Link>
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={approveComment.bind(null, c.id)}>
                      <button
                        type="submit"
                        className="rounded bg-foreground px-3 py-1 text-xs font-medium text-background hover:opacity-80"
                      >
                        Zatwierdź
                      </button>
                    </form>
                    <form action={deleteComment.bind(null, c.id)}>
                      <button
                        type="submit"
                        className="rounded border border-destructive px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Usuń
                      </button>
                    </form>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section>
        <h2 className="mb-4 text-sm tracking-[0.2em] uppercase text-muted-foreground">
          Zatwierdzone ({approved.length})
        </h2>

        {approved.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Brak zatwierdzonych komentarzy.
          </p>
        ) : (
          <div className="space-y-3">
            {approved.map((c) => (
              <div key={c.id} className="rounded-lg border p-4 opacity-70">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium">{c.authorName}</span>
                    <span className="ml-3 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString("pl-PL")}
                    </span>
                    <span className="ml-3 text-xs text-muted-foreground">
                      →{" "}
                      <Link
                        href={`/gallery/${c.photo.slug}`}
                        className="hover:underline"
                        target="_blank"
                      >
                        {c.photo.title ?? c.photo.slug}
                      </Link>
                    </span>
                  </div>
                  <form action={deleteComment.bind(null, c.id)}>
                    <button
                      type="submit"
                      className="rounded border border-destructive px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Usuń
                    </button>
                  </form>
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
