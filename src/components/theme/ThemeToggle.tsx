"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useLang } from "@/i18n/LangContext";

interface Props {
  hasBg?: boolean;
}

export function ThemeToggle({ hasBg }: Props) {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.theme.toLight : t.theme.toDark}
      className={`flex h-8 w-8 items-center justify-center transition-colors ${
        hasBg
          ? "text-black/40 hover:text-black dark:text-white/50 dark:hover:text-white"
          : "text-white/50 hover:text-white"
      }`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
