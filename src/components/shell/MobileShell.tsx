"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/40 backdrop-blur">
        <div
          className="px-4 py-3 flex items-center justify-between gap-3"
          style={{ paddingTop: "calc(12px + var(--safe-top))" }}
        >
          <button
            onClick={() => setOpen(true)}
            className="h-12 w-12 rounded-2xl border border-zinc-800/70 bg-zinc-950/35 flex items-center justify-center"
            aria-label="Abrir menu"
          >
            <span className="text-zinc-100 text-2xl leading-none">≡</span>
          </button>

          <div className="flex-1 text-center">
            <div className="text-[11px] tracking-widest uppercase text-muted2">
              Organize
            </div>
            <div className="text-base font-semibold text-zinc-100">
              {activeLabel}
            </div>
          </div>

          <div className="h-12 w-12 rounded-2xl border border-violet-500/25 bg-violet-500/10 flex items-center justify-center text-violet-200 font-semibold">
            AI
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div
        className="px-4 py-4"
        style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
      >
        <main className="panel p-5">{children}</main>

        <footer className="mt-3 text-[12px] text-muted2 px-1">
          Organize.ia • Interface premium
        </footer>
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
            "absolute left-0 top-0 h-full w-[86%] max-w-[360px] border-r border-zinc-800/70 bg-zinc-950/90 backdrop-blur transition-transform",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div
            className="p-5"
            style={{ paddingTop: "calc(18px + var(--safe-top))" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-muted2 uppercase tracking-widest">
                  Organize
                </div>
                <div className="text-xl font-semibold tracking-tight">
                  <span className="text-zinc-100">Organize</span>
                  <span className="text-violet-300">.ia</span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="h-12 w-12 rounded-2xl border border-zinc-800/70 bg-zinc-950/35 flex items-center justify-center text-zinc-100"
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-2">
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
                      "w-full text-left px-4 py-4 rounded-2xl border transition text-base",
                      active
                        ? "border-violet-500/30 bg-violet-500/10 text-zinc-100"
                        : "border-zinc-800/70 bg-zinc-950/35 text-zinc-200 hover:bg-zinc-950/45"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 panel p-4">
              <div className="text-[12px] text-muted2">Dica de execução</div>
              <div className="mt-1 text-base text-zinc-100">
                Mantenha 5–8 tarefas no foco do dia.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}