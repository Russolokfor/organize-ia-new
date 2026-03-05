"use client";

import React from "react";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Card base premium e 100% mobile-safe.
 * Compatível com:
 * - import Card from "@/components/ui/Card" (default)
 * - import { Card } from "@/components/ui/Card" (named)
 */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("panel w-full max-w-full min-w-0", className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "w-full max-w-full min-w-0",
        "px-4 py-4 sm:px-5 sm:py-5",
        "flex flex-col gap-3",
        className
      )}
    >
      {children}
    </header>
  );
}

export function CardHeaderRow({
  className,
  left,
  right,
}: {
  className?: string;
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0",
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">{left}</div>

      {right ? (
        <div className={cn("min-w-0", "flex flex-wrap gap-2 sm:justify-end")}>
          {right}
        </div>
      ) : null}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      className={cn(
        "text-[11px] uppercase tracking-widest text-muted2",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardHeadline({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-1 text-2xl sm:text-3xl font-semibold text-zinc-100",
        "leading-tight",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("mt-2 text-base text-muted leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0",
        "px-4 pb-4 sm:px-5 sm:pb-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardActionButton({
  className,
  children,
  onClick,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary";
}) {
  const base = "rounded-2xl border px-4 py-3 text-base transition min-w-0";
  const look =
    variant === "primary"
      ? "border-violet-500/30 bg-violet-500/12 text-zinc-100 hover:bg-violet-500/18"
      : "border-zinc-800/70 bg-zinc-950/35 text-zinc-200 hover:bg-zinc-950/45";

  return (
    <button
      onClick={onClick}
      className={cn(base, look, "w-full sm:w-auto", className)}
      type="button"
    >
      {children}
    </button>
  );
}

/** ✅ Compatibilidade total com imports antigos */
export default Card;