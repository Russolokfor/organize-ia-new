"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  IconChart,
  IconCheck,
  IconHome,
  IconInbox,
  IconMenu,
  IconPlus,
} from "../ui/Icons";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Organização", href: "/organization" },
  { label: "Rotina", href: "/routine" },
  { label: "Desempenho", href: "/performance" },
];

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const activeLabel = useMemo(() => {
    const found = NAV.find((i) => pathname?.startsWith(i.href));
    return found?.label ?? "Organize.ia";
  }, [pathname]);

  const dockActive = (href: string) => (pathname ? pathname.startsWith(href) : false);

  return (
    <div className="min-h-screen w-full layout-inner">
      {/* Topbar (inline — sem MobileHeader separado pra não dar erro) */}
      <div className="sticky top-0 z-50 layout-inner">
        <div
          className="border-b layout-inner"
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
              onClick={() => setOpen(true)}
              className={cn(
                "focus-ring",
                "h-12 w-12 rounded-2xl border",
                "flex items-center justify-center shrink-0"
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
              <div className="text-[16px] font-semibold text-[var(--text)] truncate">
                {activeLabel}
              </div>
            </div>

            <div
              className={cn(
                "h-12 px-4 rounded-2xl border",
                "flex items-center justify-center font-semibold shrink-0"
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

      {/* Conteúdo */}
      <div
        className="px-4 py-4 w-full max-w-screen-sm mx-auto layout-inner"
        style={{ paddingBottom: "calc(120px + var(--safe-bottom))" }}
      >
        <main className="w-full max-w-full min-w-0 overflow-x-clip layout-inner">
          {children}
        </main>

        <footer className="mt-3 text-[12px] text-muted2 px-1 layout-inner">
          Organize.ia • Interface premium
        </footer>
      </div>

      {/* Dock flutuante (único) */}
      <div
        className={cn(
          "fixed z-50 left-1/2 -translate-x-1/2",
          "bottom-[calc(14px+var(--safe-bottom))]",
          "w-[92%] max-w-[420px]"
        )}
      >
        <div
          className={cn("panel", "px-4 py-3 flex items-center justify-between gap-3")}
          style={{
            borderColor: "rgba(32, 68, 115, 0.55)",
            boxShadow:
              "0 18px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(238,12,242,0.06)",
          }}
        >
          <DockBtn
            label="Hoje"
            active={dockActive("/dashboard")}
            onClick={() => router.push("/dashboard")}
            icon={<IconHome size={20} />}
          />
          <DockBtn
            label="Rotina"
            active={dockActive("/routine")}
            onClick={() => router.push("/routine")}
            icon={<IconCheck size={20} />}
          />

          {/* FAB */}
          <button
            type="button"
            onClick={() => router.push("/organization")}
            className={cn(
              "focus-ring",
              "h-12 w-12 rounded-2xl border",
              "flex items-center justify-center"
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

          <DockBtn
            label="Inbox"
            active={dockActive("/inbox")}
            onClick={() => router.push("/inbox")}
            icon={<IconInbox size={20} />}
          />
          <DockBtn
            label="Stats"
            active={dockActive("/performance")}
            onClick={() => router.push("/performance")}
            icon={<IconChart size={20} />}
          />
        </div>
      </div>

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[9998] transition",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[86%] max-w-[360px] border-r backdrop-blur transition-transform",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          style={{
            borderColor: "rgba(32, 68, 115, 0.45)",
            background: "rgba(1,13,38,0.92)",
          }}
        >
          <div
            className="p-5 layout-inner"
            style={{ paddingTop: "calc(18px + var(--safe-top))" }}
          >
            <div className="flex items-center justify-between gap-3 layout-inner">
              <div className="min-w-0">
                <div className="text-[11px] text-muted2 uppercase tracking-[0.28em]">
                  ORGANIZE
                </div>
                <div className="text-xl font-semibold tracking-tight">
                  <span className="text-[var(--text)]">Organize</span>
                  <span style={{ color: "rgba(238,12,242,0.85)" }}>.ia</span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className={cn(
                  "focus-ring",
                  "h-12 w-12 rounded-2xl border",
                  "flex items-center justify-center shrink-0"
                )}
                style={{
                  borderColor: "rgba(32, 68, 115, 0.5)",
                  background: "rgba(1,13,38,0.55)",
                  color: "rgba(250,250,252,0.92)",
                }}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-2 layout-inner">
              {NAV.map((item) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                    className={cn(
                      "focus-ring",
                      "w-full text-left px-4 py-4 rounded-2xl border transition text-base layout-inner"
                    )}
                    style={{
                      borderColor: active
                        ? "rgba(238,12,242,0.30)"
                        : "rgba(32, 68, 115, 0.45)",
                      background: active
                        ? "rgba(238,12,242,0.10)"
                        : "rgba(1,13,38,0.55)",
                      color: active
                        ? "rgba(250,250,252,0.94)"
                        : "rgba(233,233,240,0.82)",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 panel p-4 layout-inner">
              <div className="text-[12px] text-muted2">Dica de execução</div>
              <div className="mt-1 text-base text-[var(--text)]">
                Mantenha 5–8 tarefas no foco do dia.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DockBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
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
      {icon}
      <span className="text-[11px] tracking-wide">{label}</span>
    </button>
  );
}