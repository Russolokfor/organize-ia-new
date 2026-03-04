"use client";

import React from "react";

type Point = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function AreaSparkline({
  values,
  heightClass = "h-44 sm:h-56",
}: {
  values: number[];
  heightClass?: string;
}) {
  const w = 1000;
  const h = 260;
  const padX = 24;
  const padY = 18;

  const safe = values?.length ? values : [0, 0, 0, 0, 0];

  const minV = Math.min(...safe);
  const maxV = Math.max(...safe);
  const range = maxV - minV || 1;

  const points: Point[] = safe.map((v, i) => {
    const t = safe.length === 1 ? 0 : i / (safe.length - 1);
    const x = padX + t * (w - padX * 2);
    const yn = (v - minV) / range;
    const y = padY + (1 - yn) * (h - padY * 2);
    return { x, y };
  });

  const line = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  const area = `${line} L ${w - padX} ${h - padY} L ${padX} ${h - padY} Z`;

  // “Bolinha” no último ponto
  const last = points[points.length - 1];
  const lastY = clamp(last.y, padY, h - padY);

  return (
    <div className={`w-full ${heightClass} overflow-hidden rounded-2xl`}>
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.35)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.00)" />
          </linearGradient>

          <linearGradient id="sparkLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.35)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.95)" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#sparkArea)" />
        <path
          d={line}
          fill="none"
          stroke="url(#sparkLine)"
          strokeWidth="10"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.95"
        />

        <circle cx={last.x} cy={lastY} r="12" fill="rgba(168, 85, 247, 0.95)" />
      </svg>
    </div>
  );
}