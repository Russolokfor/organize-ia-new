"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Organização", href: "/organization" },
    { name: "Rotina", href: "/routine" },
    { name: "Desempenho", href: "/performance" },
  ];

  return (
    <div className="min-h-screen">

      {/* Topbar */}
      <div className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">

          <button
            onClick={() => setOpen(true)}
            className="h-10 w-10 rounded-xl border border-zinc-800 flex items-center justify-center"
          >
            ☰
          </button>

          <div className="text-sm font-semibold text-zinc-100">
            Organize<span className="text-violet-300">.ia</span>
          </div>

          <div className="h-10 w-10 rounded-xl border border-violet-500/30 flex items-center justify-center text-violet-200">
            AI
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-4">
        {children}
      </div>

      {/* Menu lateral */}
      {open && (
        <div className="fixed inset-0 z-[999]">

          {/* overlay */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          {/* painel */}
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-[300px] bg-zinc-950 border-r border-zinc-800 p-5">

            <div className="text-lg font-semibold text-zinc-100 mb-6">
              Organize<span className="text-violet-300">.ia</span>
            </div>

            <div className="space-y-2">
              {nav.map((item) => {
                const active = pathname?.startsWith(item.href);

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition
                      ${
                        active
                          ? "border-violet-500/40 bg-violet-500/10 text-white"
                          : "border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                      }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}