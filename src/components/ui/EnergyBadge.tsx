"use client";

export default function EnergyBadge({ value }: { value?: string | null }) {
  const v = (value ?? "medium").toLowerCase();

  const map: Record<string, string> = {
    low: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    medium: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    high: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  };

  const cls =
    map[v] ?? "border-slate-400/25 bg-slate-400/10 text-slate-200";

  const label = v === "low" ? "Baixa" : v === "high" ? "Alta" : "Média";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs",
        "border",
        cls,
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      Energia {label}
    </span>
  );
}