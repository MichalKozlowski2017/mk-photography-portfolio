import { formatAperture, formatFocalLength } from "@/lib/utils/photo";
import type { PhotoWithExif } from "@/types";
import { Camera, Aperture, Timer, Zap, Focus, CalendarDays } from "lucide-react";

interface ExifPanelProps {
  exif: PhotoWithExif["exif"];
}

export function ExifPanel({ exif }: ExifPanelProps) {
  if (!exif) return null;

  const items = [
    {
      icon: <Camera className="h-4 w-4" />,
      label: "Aparat",
      value: [exif.cameraMake, exif.cameraModel].filter(Boolean).join(" ") || null,
    },
    {
      icon: <Focus className="h-4 w-4" />,
      label: "Obiektyw",
      value: exif.lens ?? null,
    },
    {
      icon: <Focus className="h-4 w-4" />,
      label: "Ogniskowa",
      value: formatFocalLength(exif.focalLength),
    },
    {
      icon: <Aperture className="h-4 w-4" />,
      label: "Przysłona",
      value: formatAperture(exif.aperture),
    },
    {
      icon: <Timer className="h-4 w-4" />,
      label: "Czas naświetlania",
      value: exif.exposureTime ?? null,
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: "ISO",
      value: exif.iso ? `ISO ${exif.iso}` : null,
    },
    {
      icon: <CalendarDays className="h-4 w-4" />,
      label: "Data",
      value: exif.takenAt
        ? new Date(exif.takenAt).toLocaleDateString("pl-PL", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null,
    },
  ].filter((item) => item.value !== null);

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Dane EXIF
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
