"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLang } from "@/i18n/LangContext";

const SORT_OPTIONS = ["dateDesc", "dateAsc", "uploadDesc", "ratingDesc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: SortOption = "dateDesc";

interface SortSelectProps {
  current: SortOption;
}

export function SortSelect({ current }: SortSelectProps) {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function onChange(value: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_SORT) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] tracking-[0.2em] uppercase text-zinc-400 dark:text-white/30">
        {t.gallery.sortBy}
      </span>
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`border px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-colors ${
              current === opt
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-300 text-zinc-400 hover:border-zinc-500 hover:text-zinc-700 dark:border-white/20 dark:text-white/40 dark:hover:border-white/50 dark:hover:text-white/80"
            }`}
          >
            {t.gallery.sort[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
