"use client";

import React from "react";
import { IconMenu } from "../ui/Icons";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function MobileHeader({ onMenu }: { onMenu?: () => void }) {
  return (
    <div className="sticky top-0 z-40 layout-inner">
      <div
        className={cn("layout-inner", "border-b")}
        style={{
          borderColor: "rgba(32, 68, 115, 0.35)",
          background:
            "linear-gradient(180deg, rgba(1,13,38,0.72), rgba(1,13,38,0.35))",
          backdropFilter: "blur(18px)",
          paddingTop: "var(--safe-top)",
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3 layout-inner">
          <button
            type="button"
            onClick={onMenu}
            className={cn(
              "focus-ring",
              "h-12 w-12 rounded-2xl",
              "flex items-center justify-center",
              "border"
            )}
            style={{
              borderColor: "rgba(32, 68, 115, 0.5)",
              background: "rgba(1,13,38,0.55)",
              color: "rgba(250,250,252,0.92)",
            }}
            aria-label="Abrir menu"
          >
            <IconMenu size={22} />
          </button>

          <div className="flex-1 min-w-0 text-center">
            <div className="text-[11px] tracking-[0.28em] uppercase text-muted2">
              ORGANIZE
            </div>
            <div className="text-[18px] font-semibold text-[var(--text)] truncate">
              Organize.ia
            </div>
          </div>

          <div
            className={cn(
              "h-12 px-4 rounded-2xl border",
              "flex items-center justify-center font-semibold"
            )}
            style={{
              borderColor: "rgba(238,12,242,0.35)",
              background: "rgba(238,12,242,0.10)",
              color: "rgba(250,250,252,0.95)",
            }}
          >
            AI
          </div>
        </div>
      </div>
    </div>
  );
}