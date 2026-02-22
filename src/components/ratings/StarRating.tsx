"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitRating } from "@/app/actions/ratings";
import { useLang } from "@/i18n/LangContext";

interface Props {
  photoId: string;
  averageRating: number | null;
  ratingCount: number;
  userRating: number | null;
}

export function StarRating({ photoId, averageRating, ratingCount, userRating: initial }: Props) {
  const { t } = useLang();
  const [hovered, setHovered] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(initial);
  const [isPending, startTransition] = useTransition();

  const displayValue = hovered ?? userRating ?? 0;

  function handleClick(value: number) {
    setUserRating(value);
    startTransition(async () => {
      await submitRating(photoId, value);
    });
  }

  const avg = averageRating != null ? averageRating.toFixed(1) : null;

  return (
    <div className="space-y-2">
      {/* Stars */}
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => handleClick(v)}
            onMouseEnter={() => setHovered(v)}
            disabled={isPending}
            aria-label={`${t.rating.rate} ${v}`}
            className="transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              className="h-5 w-5 transition-colors"
              fill={v <= displayValue ? "currentColor" : "none"}
              strokeWidth={1.5}
              style={{
                color: v <= displayValue ? "#f59e0b" : "rgba(255,255,255,0.2)",
              }}
            />
          </button>
        ))}

        {/* User feedback */}
        {userRating && (
          <span className="ml-2 text-[11px] tracking-[0.15em] uppercase text-amber-400/70">
            {t.rating.yours}
          </span>
        )}
      </div>

      {/* Average */}
      <p className="text-[11px] text-white/30">
        {avg != null ? (
          <>
            {avg} / 5 &nbsp;·&nbsp; {t.rating.count(ratingCount)}
          </>
        ) : (
          t.rating.noRatings
        )}
      </p>
    </div>
  );
}
