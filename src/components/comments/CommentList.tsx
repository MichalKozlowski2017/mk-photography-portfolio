"use client";

import { useLang } from "@/i18n/LangContext";

export interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface Props {
  comments: CommentItem[];
}

export function CommentList({ comments }: Props) {
  const { t } = useLang();

  if (comments.length === 0) {
    return <p className="text-sm text-white/30">{t.comments.empty}</p>;
  }

  return (
    <ul className="space-y-5">
      {comments.map((c) => (
        <li key={c.id} className="border-b border-white/10 pb-5">
          <div className="mb-1 flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-white/80">{c.authorName}</span>
            <span className="shrink-0 text-[11px] text-white/30">
              {new Date(c.createdAt).toLocaleDateString(t.exif.dateLocale)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/55">{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
