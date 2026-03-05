"use client";

import "./globals.css";
import React from "react";
import { usePathname } from "next/navigation";

import MobileShell from "../components/shell/MobileShell";
import Sidebar from "../components/shell/Sidebar";
import Topbar from "../components/shell/Topbar";

import { ToastProvider } from "../components/ui/ToastProvider";
import AlertInterceptor from "../components/ui/AlertInterceptor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <div
              className="min-h-screen w-full"
              style={{
                paddingTop: "var(--safe-top)",
                paddingBottom: "var(--safe-bottom)",
              }}
            >
              {children}
            </div>
          ) : (
            <div className="min-h-screen w-full">
              {/* Desktop */}
              <div className="hidden lg:block">
                <div className="mx-auto max-w-[1400px] px-4 py-4">
                  <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                    <Sidebar />

                    <div className="grid gap-4">
                      <Topbar />

                      <main className="panel p-5 md:p-6">{children}</main>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile */}
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