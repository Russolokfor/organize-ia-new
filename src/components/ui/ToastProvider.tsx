"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type ToastVariant = "default" | "success" | "warning" | "danger";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextValue = {
  toast: (t: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = (t: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    const item: ToastItem = {
      id,
      title: t.title,
      description: t.description,
      variant: t.variant ?? "default",
      duration: t.duration ?? 3200,
    };

    setItems((prev) => [item, ...prev]);

    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, item.duration);
  };

  const value = useMemo(() => ({ toast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div className="fixed right-4 top-4 z-[9999] flex w-[92vw] max-w-[380px] flex-col gap-3">
        {items.map((t) => {
          const variantStyles =
            t.variant === "success"
              ? "border-emerald-500/20 bg-emerald-500/10"
              : t.variant === "warning"
              ? "border-amber-500/20 bg-amber-500/10"
              : t.variant === "danger"
              ? "border-rose-500/20 bg-rose-500/10"
              : "border-zinc-800/70 bg-zinc-950/40";

          const dot =
            t.variant === "success"
              ? "bg-emerald-400"
              : t.variant === "warning"
              ? "bg-amber-400"
              : t.variant === "danger"
              ? "bg-rose-400"
              : "bg-violet-300";

          return (
            <div
              key={t.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border shadow-sm backdrop-blur",
                variantStyles
              )}
            >
              {/* glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/18 to-transparent" />

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-1 h-2.5 w-2.5 rounded-full", dot)} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-zinc-100">
                      {t.title}
                    </div>
                    {t.description ? (
                      <div className="mt-1 text-xs text-zinc-400">
                        {t.description}
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={() =>
                      setItems((prev) => prev.filter((x) => x.id !== t.id))
                    }
                    className="text-zinc-400 hover:text-zinc-200 transition text-sm"
                    aria-label="Fechar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider />");
  return ctx;
}