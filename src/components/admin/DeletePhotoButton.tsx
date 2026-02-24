"use client";

import { useTransition } from "react";
import { deletePhoto } from "@/app/actions/photos";
import { Trash2 } from "lucide-react";

interface DeletePhotoButtonProps {
  photoId: string;
  photoTitle: string;
}

export function DeletePhotoButton({ photoId, photoTitle }: DeletePhotoButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Czy na pewno chcesz usunąć zdjęcie „${photoTitle}"?\n\nZostanie usunięte z bazy danych i Cloudinary. Tej operacji nie można cofnąć.`,
      )
    )
      return;

    startTransition(async () => {
      const result = await deletePhoto(photoId);
      if (result.error) alert(`Błąd: ${result.error}`);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Usuń zdjęcie"
      className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isPending ? "Usuwanie…" : "Usuń"}
    </button>
  );
}
