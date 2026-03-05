"use client";

import "./globals.css";
import React from "react";
import { usePathname } from "next/navigation";

import MobileShell from "@/components/shell/MobileShell";
import Sidebar from "@/components/shell/Sidebar";
import Topbar from "@/components/shell/Topbar";

import { ToastProvider } from "@/components/ui/ToastProvider";
import AlertInterceptor from "@/components/ui/AlertInterceptor";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/api/auth");

  return (
    <html lang="pt-BR" className="dark">
      <body>
        <div className="app-bg" />

        <div className="layout-root">
          <ToastProvider>
            <AlertInterceptor />

            {isAuthRoute ? (
              <div
                className="min-h-screen w-full layout-inner"
                style={{
                  paddingTop: "var(--safe-top)",
                  paddingBottom: "var(--safe-bottom)",
                }}
              >
                {children}
              </div>
            ) : (
              <div className="min-h-screen w-full layout-inner">
                {/* Desktop */}
                <div className="hidden lg:block layout-inner">
                  <div className="mx-auto max-w-[1400px] px-4 py-4 layout-inner">
                    <div className="grid gap-4 lg:grid-cols-[280px_1fr] layout-inner">
                      <Sidebar />
                      <div className="grid gap-4 layout-inner">
                        <Topbar />
                        <main className="panel p-5 md:p-6 layout-inner">
                          {children}
                        </main>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden layout-inner">
                  <MobileShell>{children}</MobileShell>
                </div>
              </div>
            )}
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}