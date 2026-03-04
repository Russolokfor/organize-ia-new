// src/components/ui/Card.tsx
import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export default function Card({
  children,
  className = "",
  title,
  subtitle,
  rightSlot,
}: CardProps) {
  return (
    <section
      className={[
        "rounded-3xl border border-zinc-800/70 bg-zinc-900/20 shadow-sm",
        className,
      ].join(" ")}
    >
      {(title || subtitle || rightSlot) && (
        <header className="px-5 pt-5 md:px-6 md:pt-6 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
          </div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </header>
      )}

      <div className="px-5 pb-5 pt-4 md:px-6 md:pb-6">{children}</div>
    </section>
  );
}