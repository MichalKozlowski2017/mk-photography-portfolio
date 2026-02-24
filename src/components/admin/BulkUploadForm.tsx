"use client";

import { useState, useRef, useCallback, useId } from "react";
import { Upload, X, CheckCircle2, AlertCircle, ImagePlus, Loader2, Clock } from "lucide-react";
import exifr from "exifr";

// ---------------------------------------------------------------------------
// XHR upload helper — gives us per-file upload progress events
// ---------------------------------------------------------------------------
function uploadFileXHR(
  formData: FormData,
  onProgress: (loaded: number, total: number) => void,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(e.loaded, e.total);
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true });
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ ok: false, error: data.error ?? "Błąd uploadu" });
        } catch {
          resolve({ ok: false, error: "Błąd uploadu" });
        }
      }
    });

    xhr.addEventListener("error", () => resolve({ ok: false, error: "Błąd sieci" }));
    xhr.send(formData);
  });
}

// ---------------------------------------------------------------------------
// Progress overlay
// ---------------------------------------------------------------------------
interface UploadProgressState {
  currentFileName: string;
  currentFilePercent: number;
  overallPercent: number;
  filesTotal: number;
  filesDone: number;
  secondsLeft: number | null;
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return "obliczanie…";
  if (seconds < 5) return "za chwilę";
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m} min ${s < 10 ? "0" : ""}${s} s`;
}

function UploadProgressOverlay({ progress }: { progress: UploadProgressState }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-white/60" />
          <h2 className="text-lg font-semibold text-white">Wysyłanie zdjęć&hellip;</h2>
        </div>

        {/* Overall progress */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/60 font-medium">Łączny postęp</span>
            <span className="font-mono font-semibold text-white">{progress.overallPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-200"
              style={{ width: `${progress.overallPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-center text-xs text-white/40">
            {progress.filesDone} / {progress.filesTotal}{" "}
            {progress.filesTotal === 1 ? "zdjęcie" : "zdjęć"}
          </p>
        </div>

        {/* Current file progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-white/50" title={progress.currentFileName}>
              {progress.currentFileName}
            </span>
            <span className="shrink-0 font-mono font-medium text-white/80">
              {progress.currentFilePercent}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-100"
              style={{ width: `${progress.currentFilePercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
            <p className="mb-0.5 text-[11px] uppercase tracking-widest text-white/30">Ukończone</p>
            <p className="font-mono text-2xl font-semibold text-white">
              {progress.overallPercent}%
            </p>
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
            <div className="mb-0.5 flex items-center justify-center gap-1">
              <Clock className="h-2.5 w-2.5 text-white/30" />
              <p className="text-[11px] uppercase tracking-widest text-white/30">Pozostało</p>
            </div>
            <p className="font-mono text-sm font-semibold text-white leading-tight mt-0.5">
              {formatTime(progress.secondsLeft)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Category {
  id: string;
  name: string;
}

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  baseTitle: string; // niezmienna data z EXIF / nazwa pliku
  title: string; // wyświetlana i wysyłana
  categoryId: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

function titleFromDate(date: Date): string {
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

async function generateTitle(file: File): Promise<string> {
  try {
    const raw = await exifr.parse(file, { pick: ["DateTimeOriginal", "DateTime"] });
    if (raw?.DateTimeOriginal) return titleFromDate(new Date(raw.DateTimeOriginal));
    if (raw?.DateTime) return titleFromDate(new Date(raw.DateTime));
  } catch {
    // ignore
  }
  return titleFromFilename(file.name);
}

interface BulkUploadFormProps {
  categories: Category[];
}

export function BulkUploadForm({ categories }: BulkUploadFormProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [globalCategory, setGlobalCategory] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropId = useId();

  function buildTitle(prefix: string, base: string) {
    return prefix.trim() ? `${prefix.trim()}, ${base}` : base;
  }

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!arr.length) return;

      const newEntries = await Promise.all(
        arr.map(async (file) => {
          const baseTitle = await generateTitle(file);
          const preview = URL.createObjectURL(file);
          return {
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview,
            baseTitle,
            title: buildTitle(titlePrefix, baseTitle),
            categoryId: "",
            status: "pending" as const,
          };
        }),
      );

      setEntries((prev) => [...prev, ...newEntries]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [titlePrefix],
  );

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }

  function removeEntry(id: string) {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.id !== id);
    });
  }

  function updateEntry(id: string, patch: Partial<FileEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function applyGlobalCategory() {
    if (!globalCategory) return;
    setEntries((prev) => prev.map((e) => ({ ...e, categoryId: globalCategory })));
  }

  function applyTitlePrefix() {
    setEntries((prev) =>
      prev.map((e) =>
        e.status === "pending" ? { ...e, title: buildTitle(titlePrefix, e.baseTitle) } : e,
      ),
    );
  }

  async function uploadAll() {
    const pending = entries.filter((e) => e.status === "pending");
    if (!pending.length) return;

    const filesTotal = pending.length;
    const totalBytes = pending.reduce((s, e) => s + e.file.size, 0);
    let cumulativeBytes = 0;
    const startTime = Date.now();

    setIsUploading(true);
    setUploadProgress({
      currentFileName: pending[0].file.name,
      currentFilePercent: 0,
      overallPercent: 0,
      filesTotal,
      filesDone: 0,
      secondsLeft: null,
    });

    for (let i = 0; i < pending.length; i++) {
      const entry = pending[i];
      updateEntry(entry.id, { status: "uploading" });
      setUploadProgress((prev) =>
        prev
          ? { ...prev, currentFileName: entry.file.name, currentFilePercent: 0, filesDone: i }
          : prev,
      );

      try {
        const fd = new FormData();
        fd.append("file", entry.file);
        fd.append("title", entry.title);
        if (entry.categoryId) fd.append("categoryId", entry.categoryId);

        const result = await uploadFileXHR(fd, (loaded, fileSize) => {
          const bytesUploaded = cumulativeBytes + loaded;
          const overallPercent = Math.min(100, Math.round((bytesUploaded / totalBytes) * 100));
          const filePercent = Math.min(100, Math.round((loaded / fileSize) * 100));

          const elapsed = Date.now() - startTime;
          const rate = elapsed > 800 && bytesUploaded > 0 ? bytesUploaded / elapsed : null; // bytes/ms
          const secondsLeft = rate ? Math.round((totalBytes - bytesUploaded) / rate / 1000) : null;

          setUploadProgress({
            currentFileName: entry.file.name,
            currentFilePercent: filePercent,
            overallPercent,
            filesTotal,
            filesDone: i,
            secondsLeft,
          });
        });

        cumulativeBytes += entry.file.size;

        if (!result.ok) {
          updateEntry(entry.id, { status: "error", error: result.error ?? "Błąd uploadu" });
        } else {
          updateEntry(entry.id, { status: "done" });
        }
      } catch (err: any) {
        cumulativeBytes += entry.file.size;
        updateEntry(entry.id, { status: "error", error: err.message ?? "Nieznany błąd" });
      }
    }

    setUploadProgress(null);
    setIsUploading(false);
  }

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const doneCount = entries.filter((e) => e.status === "done").length;
  const errorCount = entries.filter((e) => e.status === "error").length;

  return (
    <>
      {uploadProgress && <UploadProgressOverlay progress={uploadProgress} />}
      <div className="space-y-6">
        {/* Drop zone */}
        <div
          id={dropId}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-8 py-12 transition-colors ${
            isDragging
              ? "border-foreground bg-muted/40"
              : "border-muted-foreground/30 hover:border-muted-foreground/60"
          }`}
        >
          <ImagePlus className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">Przeciągnij zdjęcia lub kliknij by wybrać</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, HEIC — wiele plików naraz</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {entries.length > 0 && (
          <>
            {/* Global settings bar */}
            <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              {/* Prefix tytułu */}
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm font-medium">Prefiks tytułu:</span>
                <input
                  type="text"
                  value={titlePrefix}
                  onChange={(e) => setTitlePrefix(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyTitlePrefix()}
                  placeholder="np. Wakacje"
                  className="min-w-0 flex-1 rounded border bg-background px-3 py-1.5 text-sm"
                />
                <button
                  onClick={applyTitlePrefix}
                  className="shrink-0 rounded border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  Zastosuj
                </button>
              </div>
              {/* Kategoria globalna */}
              {categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm font-medium">Kategoria:</span>
                  <select
                    value={globalCategory}
                    onChange={(e) => setGlobalCategory(e.target.value)}
                    className="min-w-0 flex-1 rounded border bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="">— brak —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={applyGlobalCategory}
                    disabled={!globalCategory}
                    className="shrink-0 rounded border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-40"
                  >
                    Zastosuj
                  </button>
                </div>
              )}
              {titlePrefix && (
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Podgląd:{" "}
                  <span className="font-medium">{buildTitle(titlePrefix, "15 marca 2024")}</span>
                </p>
              )}
            </div>

            {/* Files table */}
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium w-16">Podgląd</th>
                    <th className="px-4 py-3 text-left font-medium">Tytuł (z daty EXIF)</th>
                    {categories.length > 0 && (
                      <th className="px-4 py-3 text-left font-medium w-44">Kategoria</th>
                    )}
                    <th className="px-4 py-3 text-left font-medium w-28">Status</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className={entry.status === "done" ? "opacity-60" : ""}>
                      <td className="px-4 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.preview}
                          alt=""
                          className="h-12 w-16 rounded object-cover"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={entry.title}
                          onChange={(e) => updateEntry(entry.id, { title: e.target.value })}
                          disabled={entry.status !== "pending"}
                          className="w-full rounded border bg-background px-3 py-1.5 text-sm disabled:opacity-60"
                        />
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {entry.file.name}
                        </p>
                      </td>
                      {categories.length > 0 && (
                        <td className="px-4 py-2">
                          <select
                            value={entry.categoryId}
                            onChange={(e) => updateEntry(entry.id, { categoryId: e.target.value })}
                            disabled={entry.status !== "pending"}
                            className="w-full rounded border bg-background px-2 py-1.5 text-sm disabled:opacity-60"
                          >
                            <option value="">— brak —</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td className="px-4 py-2">
                        {entry.status === "pending" && (
                          <span className="text-muted-foreground">Oczekuje</span>
                        )}
                        {entry.status === "uploading" && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Wysyłanie…
                          </span>
                        )}
                        {entry.status === "done" && (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Dodano
                          </span>
                        )}
                        {entry.status === "error" && (
                          <span
                            className="flex items-center gap-1 text-red-500"
                            title={entry.error}
                          >
                            <AlertCircle className="h-3.5 w-3.5" /> Błąd
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {entry.status !== "uploading" && (
                          <button
                            onClick={() => removeEntry(entry.id)}
                            className="rounded p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary + upload button */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {pendingCount > 0 && `${pendingCount} oczekujących`}
                {doneCount > 0 && ` · ${doneCount} dodanych`}
                {errorCount > 0 && ` · ${errorCount} błędów`}
              </p>
              <div className="flex gap-3">
                {doneCount > 0 && (
                  <a
                    href="/admin/photos"
                    className="rounded-lg border px-5 py-2.5 text-sm font-medium"
                  >
                    Zobacz zdjęcia
                  </a>
                )}
                <button
                  onClick={uploadAll}
                  disabled={isUploading || pendingCount === 0}
                  className="flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-40"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Wysyłanie…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Wgraj {pendingCount > 0 ? `(${pendingCount})` : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
