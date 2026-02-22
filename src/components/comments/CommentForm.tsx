"use client";

import { useState } from "react";
import { submitComment } from "@/app/actions/comments";
import { useLang } from "@/i18n/LangContext";

interface Props {
  photoId: string;
}

export function CommentForm({ photoId }: Props) {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const authorName = (form.elements.namedItem("authorName") as HTMLInputElement).value;
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;

    setPending(true);
    setError(null);

    const result = await submitComment(photoId, authorName, content);
    setPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="border border-white/10 px-4 py-3 text-sm text-white/40">
        {t.comments.form.pending}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="authorName"
        required
        placeholder={t.comments.form.namePlaceholder}
        maxLength={100}
        className="w-full border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
      />
      <textarea
        name="content"
        required
        placeholder={t.comments.form.contentPlaceholder}
        maxLength={1000}
        rows={3}
        className="w-full resize-none border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="border border-white/20 px-5 py-2 text-[11px] tracking-[0.2em] uppercase text-white/60 transition-colors hover:border-white/60 hover:text-white disabled:opacity-40"
      >
        {pending ? "…" : t.comments.form.submit}
      </button>
    </form>
  );
}
