import { PhotoCard } from "./PhotoCard";
import type { PhotoWithExif } from "@/types";

interface PhotoGridProps {
  photos: PhotoWithExif[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">Brak zdjęć do wyświetlenia.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
