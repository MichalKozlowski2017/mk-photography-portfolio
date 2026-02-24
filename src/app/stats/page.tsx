import { prisma } from "@/lib/prisma";
import { StatsCharts, type StatsData, type CameraStats } from "@/components/stats/StatsCharts";
import { getT } from "@/i18n/server";
import { normalizeCameraModel } from "@/lib/utils/photo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statystyki — MK Shots",
};

// Format "YYYY-MM" → e.g. "Oct '22"
function formatMonth(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(year, month - 1);
  const mon = d.toLocaleDateString("en-GB", { month: "short" });
  const yr = String(year).slice(2);
  return `${mon} '${yr}`;
}

// Shorten raw lens name (e.g. "OLYMPUS M.12-100mm F4.0" → "12-100mm f/4.0")
function shortenLens(name: string): string {
  const m = name.match(/(\d+(?:-\d+)?mm)\s+[Ff]\/?(\d+(?:\.\d+)?)/);
  if (m) return `${m[1]} f/${m[2]}`;
  return name.length > 22 ? name.slice(0, 20) + "…" : name;
}

const ISO_ORDER = ["<400", "400–800", "800–1600", "1600–3200", "3200+"];

function buildByCamera(
  lensRows: { lens: string; cameraModel: string; count: number }[],
  focalRows: { mm: number; cameraModel: string; count: number }[],
  apertureRows: { value: string; cameraModel: string; count: number }[],
  isoRows: { label: string; cameraModel: string; count: number }[],
  categoryRows: { name: string; slug: string; cameraModel: string | null; count: number }[],
  cameras: string[],
): Record<string, CameraStats> {
  const keys = ["all", ...cameras];
  const result: Record<string, CameraStats> = {};

  for (const cam of keys) {
    const only = <T extends { cameraModel: string }>(rows: T[]) =>
      cam === "all" ? rows : rows.filter((r) => r.cameraModel === cam);

    // Lenses
    const lMap = new Map<string, number>();
    for (const r of only(lensRows)) lMap.set(r.lens, (lMap.get(r.lens) ?? 0) + r.count);
    const lenses = [...lMap.entries()]
      .map(([lens, count]) => ({ name: lens, shortName: shortenLens(lens), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Focal lengths
    const fMap = new Map<number, number>();
    for (const r of only(focalRows)) fMap.set(r.mm, (fMap.get(r.mm) ?? 0) + r.count);
    const focalLengths = [...fMap.entries()]
      .map(([mm, count]) => ({ label: `${mm}mm`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Apertures
    const aMap = new Map<string, number>();
    for (const r of only(apertureRows)) aMap.set(r.value, (aMap.get(r.value) ?? 0) + r.count);
    const apertures = [...aMap.entries()]
      .map(([value, count]) => ({ label: `f/${parseFloat(value)}`, count }))
      .sort((a, b) => parseFloat(a.label.slice(2)) - parseFloat(b.label.slice(2)));

    // ISO ranges
    const iMap = new Map<string, number>();
    for (const r of only(isoRows)) iMap.set(r.label, (iMap.get(r.label) ?? 0) + r.count);
    const isoRanges = ISO_ORDER.filter((l) => iMap.has(l)).map((label) => ({
      label,
      count: iMap.get(label)!,
    }));

    // Categories
    const catFiltered =
      cam === "all" ? categoryRows : categoryRows.filter((r) => r.cameraModel === cam);
    const catMap = new Map<string, number>();
    for (const r of catFiltered) catMap.set(r.name, (catMap.get(r.name) ?? 0) + r.count);
    // Keep all categories (from the "all" key seed), set 0 for missing
    const allCats = [...new Map(categoryRows.map((r) => [r.name, r.slug])).entries()];
    const categories = allCats
      .map(([name, slug]) => ({ name, slug, count: catMap.get(name) ?? 0 }))
      .sort((a, b) => b.count - a.count);

    result[cam] = { lenses, focalLengths, apertures, isoRanges, categories };
  }
  return result;
}

export default async function StatsPage() {
  const t = await getT();

  const [
    totalPhotos,
    categories,
    lensRows,
    focalRows,
    apertureRows,
    isoRows,
    timelineRows,
    cameraRows,
    categoryRows,
  ] = await Promise.all([
    prisma.photo.count({ where: { published: true } }),

    prisma.category.findMany({
      include: { _count: { select: { photos: { where: { published: true } } } } },
      orderBy: { name: "asc" },
    }),

    prisma.$queryRaw<{ lens: string; cameraModel: string; count: number }[]>`
        SELECT e.lens, e."cameraModel", COUNT(*)::int AS count
        FROM "Exif" e JOIN "Photo" p ON p.id = e."photoId"
        WHERE e.lens IS NOT NULL AND p.published = true
        GROUP BY e.lens, e."cameraModel"
        ORDER BY COUNT(*) DESC
      `,

    prisma.$queryRaw<{ mm: number; cameraModel: string; count: number }[]>`
        SELECT ROUND(e."focalLength")::int AS mm, e."cameraModel", COUNT(*)::int AS count
        FROM "Exif" e JOIN "Photo" p ON p.id = e."photoId"
        WHERE e."focalLength" IS NOT NULL AND p.published = true
        GROUP BY mm, e."cameraModel"
        ORDER BY COUNT(*) DESC
      `,

    prisma.$queryRaw<{ value: string; cameraModel: string; count: number }[]>`
        SELECT e.aperture::text AS value, e."cameraModel", COUNT(*)::int AS count
        FROM "Exif" e JOIN "Photo" p ON p.id = e."photoId"
        WHERE e.aperture IS NOT NULL AND p.published = true
        GROUP BY e.aperture, e."cameraModel"
        ORDER BY e.aperture
      `,

    prisma.$queryRaw<{ label: string; cameraModel: string; count: number }[]>`
        SELECT
          CASE
            WHEN e.iso < 400    THEN '<400'
            WHEN e.iso < 800    THEN '400–800'
            WHEN e.iso < 1600   THEN '800–1600'
            WHEN e.iso < 3200   THEN '1600–3200'
            ELSE '3200+'
          END AS label,
          e."cameraModel",
          COUNT(*)::int AS count
        FROM "Exif" e JOIN "Photo" p ON p.id = e."photoId"
        WHERE e.iso IS NOT NULL AND p.published = true
        GROUP BY label, e."cameraModel"
        ORDER BY MIN(e.iso)
      `,

    prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT TO_CHAR(e."takenAt", 'YYYY-MM') AS month, COUNT(*)::int AS count
        FROM "Exif" e JOIN "Photo" p ON p.id = e."photoId"
        WHERE e."takenAt" IS NOT NULL AND p.published = true
        GROUP BY month ORDER BY month
      `,

    prisma.$queryRaw<{ cameraModel: string; count: number }[]>`
        SELECT e."cameraModel", COUNT(*)::int AS count
        FROM "Exif" e JOIN "Photo" p ON p.id = e."photoId"
        WHERE e."cameraModel" IS NOT NULL AND p.published = true
        GROUP BY e."cameraModel"
        ORDER BY COUNT(*) DESC
      `,

    prisma.$queryRaw<{ name: string; slug: string; cameraModel: string | null; count: number }[]>`
        SELECT c.name, c.slug, e."cameraModel", COUNT(p.id)::int AS count
        FROM "Category" c
        LEFT JOIN "Photo" p ON p."categoryId" = c.id AND p.published = true
        LEFT JOIN "Exif" e ON e."photoId" = p.id
        GROUP BY c.name, c.slug, e."cameraModel"
        ORDER BY c.name
      `,
  ]);

  // Normalize raw cameraModel strings to friendly display names
  const norm = (m: string | null) => normalizeCameraModel(m) ?? m ?? "";
  const normLensRows = lensRows.map((r) => ({ ...r, cameraModel: norm(r.cameraModel) }));
  const normFocalRows = focalRows.map((r) => ({ ...r, cameraModel: norm(r.cameraModel) }));
  const normApertureRows = apertureRows.map((r) => ({ ...r, cameraModel: norm(r.cameraModel) }));
  const normIsoRows = isoRows.map((r) => ({ ...r, cameraModel: norm(r.cameraModel) }));
  const normCategoryRows = categoryRows.map((r) => ({
    ...r,
    cameraModel: r.cameraModel ? norm(r.cameraModel) : null,
  }));
  const normCameraRows = cameraRows.map((r) => ({ ...r, cameraModel: norm(r.cameraModel) }));

  const cameras = normCameraRows.map((r) => r.cameraModel);
  const categoriesWithPhotos = categories.filter((c) => c._count.photos > 0).length;

  const firstYear = timelineRows[0]?.month?.split("-")[0];
  const lastYear = timelineRows[timelineRows.length - 1]?.month?.split("-")[0];
  const yearsActive = firstYear && lastYear ? parseInt(lastYear) - parseInt(firstYear) + 1 : 1;

  const statsData: StatsData = {
    totalPhotos,
    categoriesWithPhotos,
    yearsActive,
    cameras,
    timeline: timelineRows.map((r) => ({ label: formatMonth(r.month), count: r.count })),
    byCamera: buildByCamera(
      normLensRows,
      normFocalRows,
      normApertureRows,
      normIsoRows,
      normCategoryRows,
      cameras,
    ),
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
      {/* Header */}
      <div className="border-b border-zinc-100 px-8 pb-12 pt-28 text-center dark:border-white/5">
        <p className="mb-3 text-[11px] tracking-[0.3em] uppercase text-zinc-400 dark:text-white/30">
          {t.stats.pageTitle}
        </p>
        <h1 className="font-playfair text-5xl font-semibold tracking-wide">Shots in Numbers</h1>
        <p className="mt-4 text-sm text-zinc-500 dark:text-white/40">
          {totalPhotos} {t.stats.photos} · {categoriesWithPhotos}{" "}
          {t.stats.categoriesInUse.toLowerCase()} · {yearsActive}{" "}
          {t.stats.yearsActive.toLowerCase()}
        </p>
      </div>

      {/* Charts */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <StatsCharts data={statsData} t={t.stats} catNames={t.categories} />
      </div>
    </main>
  );
}
