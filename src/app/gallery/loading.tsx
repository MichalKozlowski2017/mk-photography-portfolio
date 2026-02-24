export default function GalleryLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Sort bar skeleton */}
      <div className="mb-6 flex items-center justify-end gap-2">
        <div className="h-9 w-36 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
            style={{ animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </main>
  );
}
