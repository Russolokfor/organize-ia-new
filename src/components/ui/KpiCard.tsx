"use client";

import React from "react";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type Accent = "violet" | "blue" | "red" | "emerald" | "zinc";

type Props =
  | {
      /** formato novo (DashboardClient) */
      label: string;
      value: string | number;
      hint?: string;
      accent?: Accent | string;
      rightBadge?: string;
      /** compat: não usar quando estiver no formato novo */
      title?: never;
      subtitle?: never;
    }
  | {
      /** formato antigo (já existente no projeto) */
      title: string;
      value: string | number;
      subtitle?: string;
      rightBadge?: string;
      /** compat: não usar quando estiver no formato antigo */
      label?: never;
      hint?: never;
      accent?: never;
    };

function accentBadgeClasses(accent?: string) {
  const a = (accent ?? "violet").toLowerCase();

  // Classes pensadas para dark mode e visual premium
  switch (a) {
    case "blue":
      return "border-blue-500/25 bg-blue-500/10 text-blue-200";
    case "red":
      return "border-red-500/25 bg-red-500/10 text-red-200";
    case "emerald":
    case "green":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
    case "zinc":
    case "gray":
    case "grey":
      return "border-zinc-500/25 bg-zinc-500/10 text-zinc-200";
    case "violet":
    case "purple":
    default:
      return "border-violet-500/25 bg-violet-500/10 text-violet-200";
  }
}

export default function KpiCard(props: Props) {
  const title = "label" in props ? props.label : props.title;
  const subtitle = "hint" in props ? props.hint : props.subtitle;
  const rightBadge = props.rightBadge;
  const accent = "accent" in props ? props.accent : "violet";

  return (
    <div className={cn("panel p-5", "min-w-0 w-full max-w-full overflow-hidden")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted2">
            {title}
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-semibold text-zinc-100 break-words">
            {props.value}
          </div>

          {subtitle ? (
            <div className="mt-2 text-sm text-muted break-words">{subtitle}</div>
          ) : null}
        </div>

        {rightBadge ? (
          <div
            className={cn(
              "shrink-0 rounded-2xl border px-3 py-2 text-xs",
              accentBadgeClasses(accent as string)
            )}
          >
            {rightBadge}
          </div>
        ) : null}
      </div>
    </div>
  );
}