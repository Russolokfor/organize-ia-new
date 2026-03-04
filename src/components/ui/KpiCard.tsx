import React from "react";

export default function KpiCard(props: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "violet" | "blue" | "emerald" | "red" | "zinc";
}) {
  const accent = props.accent ?? "violet";

  const accentClass =
    accent === "violet"
      ? "from-violet-500/20 to-transparent"
      : accent === "blue"
      ? "from-blue-500/18 to-transparent"
      : accent === "emerald"
      ? "from-emerald-500/18 to-transparent"
      : accent === "red"
      ? "from-red-500/18 to-transparent"
      : "from-zinc-500/10 to-transparent";

  return (
    <div className="panel p-5 relative overflow-hidden">
      <div className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${accentClass}`} />
      <div className="text-xs uppercase tracking-widest text-zinc-500">{props.label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
        {props.value}
      </div>
      {props.hint && <div className="mt-2 text-sm text-zinc-400">{props.hint}</div>}
    </div>
  );
}