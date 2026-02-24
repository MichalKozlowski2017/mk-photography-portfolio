export default function PhotoLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Photo skeleton */}
      <div className="aspect-[3/2] w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />

      {/* Title + meta */}
      <div className="mt-6 space-y-3">
        <div className="h-7 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </main>
  );
}
