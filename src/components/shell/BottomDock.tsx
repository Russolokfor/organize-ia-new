"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconChart, IconCheck, IconHome, IconInbox, IconPlus } from "../ui/Icons";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type DockItem = {
  label: string;
  href: string;
  icon: React.FC<{ size?: number; className?: string }>;
};

const ITEMS: DockItem[] = [
  { label: "Hoje", href: "/dashboard", icon: IconHome },
  { label: "Rotina", href: "/routine", icon: IconCheck },
  { label: "Inbox", href: "/inbox", icon: IconInbox },
  { label: "Stats", href: "/performance", icon: IconChart },
];

export default function BottomDock({ onCreate }: { onCreate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed z-50 left-1/2 -translate-x-1/2",
        "bottom-[calc(14px+var(--safe-bottom))]",
        "w-[92%] max-w-[420px]"
      )}
    >
      <div
        className={cn(
          "panel",
          "px-4 py-3",
          "flex items-center justify-between gap-3"
        )}
        style={{
          borderColor: "rgba(32, 68, 115, 0.55)",
          boxShadow:
            "0 18px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(238,12,242,0.06)",
        }}
      >
        {ITEMS.slice(0, 2).map((it) => (
          <DockButton
            key={it.href}
            item={it}
            active={pathname?.startsWith(it.href)}
            onClick={() => router.push(it.href)}
          />
        ))}

        <button
          type="button"
          onClick={() => (onCreate ? onCreate() : router.push("/organization"))}
          className={cn(
            "focus-ring",
            "h-12 w-12 rounded-2xl",
            "flex items-center justify-center",
            "border"
          )}
          style={{
            borderColor: "rgba(238, 12, 242, 0.42)",
            background:
              "linear-gradient(180deg, rgba(238,12,242,0.22), rgba(79,2,89,0.18))",
            boxShadow:
              "0 16px 40px rgba(238,12,242,0.14), 0 0 0 1px rgba(238,12,242,0.10)",
            color: "rgba(250,250,252,0.95)",
          }}
          aria-label="Criar nova tarefa"
        >
          <IconPlus size={22} />
        </button>

        {ITEMS.slice(2).map((it) => (
          <DockButton
            key={it.href}
            item={it}
            active={pathname?.startsWith(it.href)}
            onClick={() => router.push(it.href)}
          />
        ))}
      </div>
    </div>
  );
}

function DockButton({
  item,
  active,
  onClick,
}: {
  item: DockItem;
  active?: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring",
        "flex flex-col items-center justify-center gap-1",
        "px-2 py-1 rounded-xl",
        "min-w-[64px]"
      )}
      style={{
        color: active ? "rgba(238,12,242,0.95)" : "rgba(233,233,240,0.62)",
      }}
    >
      <Icon size={20} />
      <span className="text-[11px] tracking-wide">{item.label}</span>
    </button>
  );
}