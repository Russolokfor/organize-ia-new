"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function crumb(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/organization")) return "Organização";
  if (pathname.startsWith("/routine")) return "Rotina";
  if (pathname.startsWith("/performance")) return "Desempenho";
  return "Início";
}

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="panel px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <div>
        <div className="text-xs uppercase tracking-widest text-zinc-500">Painel</div>
        <div className="text-xl font-semibold tracking-tight">{crumb(pathname)}</div>
        <div className="text-sm text-zinc-400 mt-1">
          Visual premium, cards e métricas em destaque.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/routine"
          className="rounded-2xl px-4 py-2 border border-zinc-800/60 bg-zinc-950/20 hover:bg-zinc-950/35 transition text-sm"
        >
          Ir para Rotina
        </Link>

        <Link
          href="/organization"
          className="rounded-2xl px-4 py-2 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15 transition text-sm text-zinc-100"
        >
          Criar tarefas
        </Link>
      </div>
    </header>
  );
}