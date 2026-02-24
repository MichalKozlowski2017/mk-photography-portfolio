"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  LabelList,
} from "recharts";
import type { Translations } from "@/i18n/translations";

export interface CameraStats {
  categories: { name: string; slug: string; count: number }[];
  lenses: { name: string; shortName: string; count: number }[];
  focalLengths: { label: string; count: number }[];
  apertures: { label: string; count: number }[];
  isoRanges: { label: string; count: number }[];
}

export interface StatsData {
  totalPhotos: number;
  categoriesWithPhotos: number;
  yearsActive: number;
  cameras: string[];
  timeline: { label: string; count: number }[];
  byCamera: Record<string, CameraStats>;
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-xl dark:border-white/10 dark:bg-zinc-900">
      {label && <p className="mb-0.5 text-[11px] text-zinc-400 dark:text-white/50">{label}</p>}
      <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
        {payload[0].value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------
function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/5 dark:bg-zinc-900/60 ${className}`}
    >
      <h3 className="mb-5 text-[11px] tracking-[0.25em] uppercase text-zinc-400 dark:text-white/35">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function cameraLabel(model: string): string {
  // "NIKON Z 6_2" → "Z 6II",  "E-M1MarkIII" → "E-M1 Mark III"
  return model
    .replace(/_(\d)$/, (_, n) => ["I", "II", "III", "IV"][parseInt(n) - 1] ?? n)
    .replace(/([a-z])([A-Z])/g, "$1 $2");
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function StatsCharts({
  data,
  t,
  catNames,
}: {
  data: StatsData;
  t: Translations["stats"];
  catNames: Record<string, string>;
}) {
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  // ── Chart color tokens (recharts uses inline styles, not Tailwind) ──────
  const axisTick = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)";
  const axisTickSm = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
  const grid = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const cursor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const labelRight = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)";
  const areaStroke = isDark ? "#e4e4e7" : "#27272a";
  const areaDot = isDark ? "#e4e4e7" : "#27272a";
  const areaActive = isDark ? "#ffffff" : "#000000";
  const gradStart = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
  const barPrimary = isDark ? "#e4e4e7" : "#18181b";
  const isoShades = isDark
    ? ["#e4e4e7", "#a1a1aa", "#71717a", "#52525b", "#3f3f46"]
    : ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];
  const barFade = (i: number, len: number) => {
    const op = Math.max(0.22, 0.9 - i * (0.68 / Math.max(len - 1, 1)));
    return isDark ? `rgba(228,228,231,${op})` : `rgba(24,24,27,${op})`;
  };
  const apertureBar = (i: number, len: number) => {
    const ratio = i / Math.max(len - 1, 1);
    return isDark
      ? `rgba(228,228,231,${0.25 + ratio * 0.65})`
      : `rgba(24,24,27,${0.3 + ratio * 0.6})`;
  };

  const filtered: CameraStats = data.byCamera[selectedCamera] ??
    data.byCamera["all"] ?? {
      lenses: [],
      focalLengths: [],
      apertures: [],
      isoRanges: [],
    };

  return (
    <div className="space-y-6">
      {/* ── KPI tiles (3) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t.totalPhotos, value: data.totalPhotos.toString() },
          { label: t.categoriesInUse, value: data.categoriesWithPhotos.toString() },
          { label: t.yearsActive, value: data.yearsActive.toString() },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-white/5 dark:bg-zinc-900/60"
          >
            <p className="font-playfair text-5xl font-semibold text-zinc-900 dark:text-white">
              {value}
            </p>
            <p className="mt-2 text-[11px] tracking-[0.18em] uppercase text-zinc-400 dark:text-white/35">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Timeline — full width, prominent ───────────────────────────── */}
      <ChartCard title={t.timeline}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.timeline} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isDark ? "#ffffff" : "#000000"}
                  stopOpacity={isDark ? 0.18 : 0.12}
                />
                <stop offset="95%" stopColor={isDark ? "#ffffff" : "#000000"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="label"
              tick={{ fill: axisTick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: axisTick, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={areaStroke}
              strokeWidth={2}
              fill="url(#timeGrad)"
              dot={{ fill: areaDot, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: areaActive }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Camera selector ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] tracking-[0.2em] uppercase text-zinc-400 dark:text-white/30">
          {t.filterByCamera}
        </span>
        <div className="flex flex-wrap gap-2">
          {/* "All" tab */}
          <button
            onClick={() => setSelectedCamera("all")}
            className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${
              selectedCamera === "all"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 dark:border-white/20 dark:text-white/50 dark:hover:border-white/50 dark:hover:text-white/80"
            }`}
          >
            {t.allCameras}
          </button>
          {/* One tab per camera */}
          {data.cameras.map((cam) => (
            <button
              key={cam}
              onClick={() => setSelectedCamera(cam)}
              className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${
                selectedCamera === cam
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 dark:border-white/20 dark:text-white/50 dark:hover:border-white/50 dark:hover:text-white/80"
              }`}
            >
              {cameraLabel(cam)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Categories + Lenses ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories — filtered */}
        <ChartCard title={t.photosByCategory}>
          <ResponsiveContainer
            width="100%"
            height={Math.max(220, filtered.categories.filter((c) => c.count > 0).length * 38)}
          >
            <BarChart
              data={filtered.categories
                .filter((c) => c.count > 0)
                .map((c) => ({ ...c, name: catNames[c.slug] ?? c.name }))}
              layout="vertical"
              margin={{ top: 0, right: 45, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: axisTickSm, fontSize: 12 }}
                width={110}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: cursor }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fill: labelRight, fontSize: 11 }}
                />
                {filtered.categories
                  .filter((c) => c.count > 0)
                  .map((_, i, arr) => (
                    <Cell key={i} fill={barFade(i, arr.length)} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Lenses — filtered */}
        <ChartCard title={t.topLenses}>
          {filtered.lenses.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-400 dark:text-white/25">{t.noData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, filtered.lenses.length * 44)}>
              <BarChart
                data={filtered.lenses}
                layout="vertical"
                margin={{ top: 0, right: 45, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fill: axisTickSm, fontSize: 10 }}
                  width={155}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: cursor }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fill: labelRight, fontSize: 11 }}
                  />
                  {filtered.lenses.map((_, i) => (
                    <Cell key={i} fill={barFade(i, filtered.lenses.length)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Focal + Aperture + ISO — filtered ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Focal lengths */}
        <ChartCard title={t.focalLengths}>
          {filtered.focalLengths.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-400 dark:text-white/25">{t.noData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={filtered.focalLengths}
                margin={{ top: 5, right: 5, left: -18, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisTick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: cursor }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={30}>
                  {filtered.focalLengths.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0
                          ? barPrimary
                          : isDark
                            ? "rgba(228,228,231,0.45)"
                            : "rgba(24,24,27,0.45)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Aperture */}
        <ChartCard title={t.aperture}>
          {filtered.apertures.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-400 dark:text-white/25">{t.noData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={filtered.apertures}
                margin={{ top: 5, right: 5, left: -18, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisTick, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: cursor }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {filtered.apertures.map((_, i) => (
                    <Cell key={i} fill={apertureBar(i, filtered.apertures.length)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ISO — horizontal bar */}
        <ChartCard title={t.isoRanges}>
          {filtered.isoRanges.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-400 dark:text-white/25">{t.noData}</p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(180, filtered.isoRanges.length * 44)}
            >
              <BarChart
                data={filtered.isoRanges}
                layout="vertical"
                margin={{ top: 0, right: 45, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: axisTickSm, fontSize: 11 }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: cursor }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fill: labelRight, fontSize: 11 }}
                  />
                  {filtered.isoRanges.map((_, i) => (
                    <Cell key={i} fill={isoShades[i] ?? (isDark ? "#27272a" : "#e4e4e7")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
