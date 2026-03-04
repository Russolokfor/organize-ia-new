import React from "react";

export default function AreaSparkline({ values }: { values: number[] }) {
  const w = 220;
  const h = 64;
  const pad = 6;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const norm = (v: number) => {
    if (max === min) return h / 2;
    const t = (v - min) / (max - min);
    return h - pad - t * (h - pad * 2);
  };

  const step = (w - pad * 2) / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = norm(v);
    return { x, y };
  });

  const dLine =
    "M " + points.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ");

  const dArea =
    dLine +
    ` L ${(pad + (values.length - 1) * step).toFixed(2)} ${(h - pad).toFixed(2)}` +
    ` L ${pad.toFixed(2)} ${(h - pad).toFixed(2)} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(124,58,237,0.35)" />
          <stop offset="100%" stopColor="rgba(124,58,237,0.00)" />
        </linearGradient>
      </defs>

      <path d={dArea} fill="url(#sparkFill)" />
      <path d={dLine} fill="none" stroke="rgba(167,139,250,0.95)" strokeWidth="2" />
    </svg>
  );
}