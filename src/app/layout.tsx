// src/app/layout.tsx
"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/shell/Sidebar";
import Topbar from "@/components/shell/Topbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthRoute = pathname?.startsWith("/login");

  return (
    <html lang="pt-BR" className="dark">
      <body>
        {/* Rotas de autenticação (login) sem sidebar/topbar */}
        {isAuthRoute ? (
          <div className="min-h-screen">{children}</div>
        ) : (
          <div className="min-h-screen">
            <div className="mx-auto max-w-[1400px] px-4 py-4">
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <Sidebar />
                <div className="grid gap-4">
                  <Topbar />
                  <main className="panel p-5 md:p-6">{children}</main>
                  <footer className="text-xs text-zinc-500 px-2 pb-2">
                    Organize.ia • Interface estilo dashboard premium
                  </footer>
                </div>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}