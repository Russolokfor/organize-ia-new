"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/shell/Sidebar";
import Topbar from "@/components/shell/Topbar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import AlertInterceptor from "@/components/ui/AlertInterceptor";
import MobileShell from "@/components/shell/MobileShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname?.startsWith("/login") || pathname?.startsWith("/auth");

  return (
    <html lang="pt-BR" className="dark">
      <body>
        <div className="app-bg" />

        <ToastProvider>
          <AlertInterceptor />

          {isAuthRoute ? (
            <div className="min-h-screen">{children}</div>
          ) : (
            <div className="min-h-screen">
              {/* Desktop */}
              <div className="hidden lg:block">
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

              {/* Mobile / Tablet */}
              <div className="lg:hidden">
                <MobileShell>{children}</MobileShell>
              </div>
            </div>
          )}
        </ToastProvider>
      </body>
    </html>
  );
}