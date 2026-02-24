"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/app/actions/categories";
import { Trash2 } from "lucide-react";

export function DeleteCategoryButton({
  id,
  name,
  photoCount,
}: {
  id: string;
  name: string;
  photoCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (photoCount > 0) {
      alert(
        `Nie można usunąć kategorii „${name}" — ma ${photoCount} ${photoCount === 1 ? "zdjęcie" : "zdjęcia/zdjęć"}.\nNajpierw przypisz te zdjęcia do innej kategorii.`,
      );
      return;
    }
    if (!confirm(`Usunąć kategorię „${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.error) alert(`Błąd: ${result.error}`);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || photoCount > 0}
      title={photoCount > 0 ? `Ma ${photoCount} zdjęć — najpierw je przepisz` : "Usuń kategorię"}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isPending ? "Usuwanie…" : "Usuń"}
    </button>
  );
}
