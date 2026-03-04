// src/components/ui/EnergyBadge.tsx
import React from "react";

type Energy = "low" | "medium" | "high";

function normalizeEnergy(value: any): Energy {
  const v = String(value ?? "").toLowerCase();

  // aceita vários formatos comuns
  if (v === "1" || v === "low" || v === "baixa" || v === "baixo") return "low";
  if (v === "2" || v === "medium" || v === "media" || v === "média") return "medium";
  if (v === "3" || v === "high" || v === "alta" || v === "alto") return "high";

  // se vier vazio, assume médio para não quebrar layout
  return "medium";
}

export default function EnergyBadge({ value }: { value?: any }) {
  const energy = normalizeEnergy(value);

  const cfg =
    energy === "low"
      ? {
          label: "Baixa",
          className:
            "border border-sky-500/25 bg-sky-500/10 text-sky-200",
        }
      : energy === "high"
      ? {
          label: "Alta",
          className:
            "border border-rose-500/25 bg-rose-500/10 text-rose-200",
        }
      : {
          label: "Média",
          className:
            "border border-violet-500/25 bg-violet-500/10 text-violet-200",
        };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${cfg.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      Energia: <span className="font-medium">{cfg.label}</span>
    </span>
  );
}