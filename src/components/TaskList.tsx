"use client";

import React from "react";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type TaskListItem = {
  id: string;
  title: string;
  dueLabel?: string; // ex: "Hoje", "2026-03-05", etc
  pinned?: boolean;
  statusLabel?: string; // ex: "Fixada"
  onClick?: () => void;
};

export default function TaskList({
  items,
  className,
  emptyText = "Sem tarefas por aqui.",
}: {
  items: TaskListItem[];
  className?: string;
  emptyText?: string;
}) {
  if (!items?.length) {
    return <div className="text-muted">{emptyText}</div>;
  }

  return (
    <div className={cn("grid gap-3 w-full max-w-full min-w-0", className)}>
      {items.map((t) => (
        <button
          key={t.id}
          onClick={t.onClick}
          className={cn(
            "w-full max-w-full min-w-0 text-left",
            "rounded-2xl border border-zinc-800/70 bg-zinc-950/25",
            "px-4 py-4",
            "hover:bg-zinc-950/35 transition"
          )}
          type="button"
        >
          {/* ✅ título: NUNCA truncate no mobile. Deixa quebrar linha */}
          <div className="text-lg sm:text-xl font-semibold text-zinc-100 whitespace-normal break-words leading-snug">
            {t.title}
          </div>

          <div className="mt-2 text-sm text-muted flex flex-wrap gap-2 items-center">
            <span className="opacity-80">Prazo:</span>
            <span className="text-zinc-200">{t.dueLabel ?? "—"}</span>

            {t.pinned ? (
              <span className="text-violet-200">• Fixada</span>
            ) : null}

            {t.statusLabel ? (
              <span className="text-zinc-300">• {t.statusLabel}</span>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
}