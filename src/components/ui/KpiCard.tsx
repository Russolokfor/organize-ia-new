"use client";

import React from "react";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function KpiCard({
  title,
  value,
  subtitle,
  rightBadge,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  rightBadge?: string;
}) {
  return (
    <div className={cn("panel p-5", "min-w-0")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted2">
            {title}
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-semibold text-zinc-100">
            {value}
          </div>
          {subtitle ? (
            <div className="mt-2 text-sm text-muted">{subtitle}</div>
          ) : null}
        </div>

        {rightBadge ? (
          <div className="shrink-0 rounded-2xl border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
            {rightBadge}
          </div>
        ) : null}
      </div>
    </div>
  );
}