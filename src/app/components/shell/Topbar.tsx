"use client";

import React from "react";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Topbar() {
  return (
    <div className={cn("panel", "px-4 py-4 flex items-center justify-between")}>
      <div className="min-w-0">
        <div className="text-[11px] tracking-widest uppercase text-muted2">
          Organize
        </div>
        <div className="text-base font-semibold text-zinc-100 truncate">
          Painel
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn h-11 px-4">Filtro</button>
        <div className="h-11 w-11 rounded-2xl border border-violet-500/25 bg-violet-500/10 flex items-center justify-center text-violet-200 font-semibold">
          AI
        </div>
      </div>
    </div>
  );
}