"use client";

import { formatAperture, formatFocalLength, normalizeCameraName } from "@/lib/utils/photo";
import type { PhotoWithExif } from "@/types";
import { Camera, Aperture, Timer, Zap, Focus } from "lucide-react";
import { useLang } from "@/i18n/LangContext";

interface ExifPanelProps {
  exif: PhotoWithExif["exif"];
}

export function ExifPanel({ exif }: ExifPanelProps) {
  const { t } = useLang();
  if (!exif) return null;

  const items = [
    {
      icon: <Camera className="h-4 w-4" />,
      label: t.exif.camera,
      value: normalizeCameraName(exif.cameraMake, exif.cameraModel),
    },
    {
      icon: <Focus className="h-4 w-4" />,
      label: t.exif.lens,
      value: exif.lens ?? null,
    },
    {
      icon: <Focus className="h-4 w-4" />,
      label: t.exif.focalLength,
      value: formatFocalLength(exif.focalLength),
    },
    {
      icon: <Aperture className="h-4 w-4" />,
      label: t.exif.aperture,
      value: formatAperture(exif.aperture),
    },
    {
      icon: <Timer className="h-4 w-4" />,
      label: t.exif.shutterSpeed,
      value: exif.exposureTime ?? null,
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: t.exif.iso,
      value: exif.iso ? `ISO ${exif.iso}` : null,
    },
  ].filter((item) => item.value !== null);

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {t.exif.title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{item.icon}</span>
            <span className="text-muted-foreground">{item.label}:</span>
            <span className="font-medium">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
