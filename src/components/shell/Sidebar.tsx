"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/organization", label: "Organização", icon: "◎" },
  { href: "/routine", label: "Rotina", icon: "↻" },
  { href: "/performance", label: "Desempenho", icon: "▤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="panel p-5 md:p-6 h-fit lg:sticky lg:top-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">Organize</div>
          <div className="text-lg font-semibold tracking-tight">
            <span className="text-zinc-100">Organize</span>
            <span className="text-violet-300">.ia</span>
          </div>
        </div>

        <div className="h-9 w-9 rounded-2xl border border-zinc-800/70 bg-zinc-950/30 flex items-center justify-center">
          <span className="text-violet-300 font-semibold">AI</span>
        </div>
      </div>

      <div className="mt-5 text-xs text-zinc-500">
        Interface premium estilo trading dashboard.
      </div>

      <nav className="mt-5 grid gap-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 border transition",
                active
                  ? "bg-violet-500/10 border-violet-500/30 text-zinc-100"
                  : "bg-zinc-950/20 border-zinc-800/60 hover:bg-zinc-950/35 hover:border-zinc-700/70 text-zinc-200",
              ].join(" ")}
            >
              <span className="text-zinc-400">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {active && (
                <span className="ml-auto text-xs text-violet-300 border border-violet-500/25 bg-violet-500/10 rounded-full px-2 py-0.5">
                  Ativo
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 panel-soft p-4">
        <div className="text-sm font-medium text-zinc-200">Dica de execução</div>
        <div className="text-sm text-zinc-500 mt-1">
          Mantenha <span className="text-zinc-300 font-medium">5–8 tarefas</span> no foco do dia.
        </div>
      </div>
    </aside>
  );
}