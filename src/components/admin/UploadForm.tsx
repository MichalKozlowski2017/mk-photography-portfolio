"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
}

export function UploadForm({ categories }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData();
    data.append("file", file);
    data.append("title", (form.elements.namedItem("title") as HTMLInputElement).value);
    data.append(
      "description",
      (form.elements.namedItem("description") as HTMLTextAreaElement).value,
    );
    data.append("categoryId", (form.elements.namedItem("categoryId") as HTMLSelectElement).value);

    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Błąd przesyłania");
    } else {
      router.push("/admin/photos");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File input */}
      <div>
        <label className="mb-1 block text-sm font-medium">Zdjęcie *</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={handleFile}
          className="w-full rounded-lg border px-4 py-2.5 text-sm"
        />
        {preview && (
          <img src={preview} alt="Podgląd" className="mt-3 max-h-48 rounded-lg object-contain" />
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Tytuł
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
          Kategoria
        </label>
        <select
          id="categoryId"
          name="categoryId"
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">Bez kategorii</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !file}
        className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {loading ? "Przesyłanie..." : "Prześlij zdjęcie"}
      </button>
    </form>
  );
}
