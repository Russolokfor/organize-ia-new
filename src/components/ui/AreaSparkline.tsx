"use client";

import React, { useMemo } from "react";

type Point = { x: string; y: number };

type Props =
  | {
      values: number[];
      heightMobile?: number;
      heightDesktop?: number;
    }
  | {
      data: Point[];
      heightMobile?: number;
      heightDesktop?: number;
    };

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Sparkline em SVG puro (sem recharts).
 * Compatível com:
 * - <AreaSparkline values={number[]} />
 * - <AreaSparkline data={Point[]} />
 */
export default function AreaSparkline(props: Props) {
  const heightMobile = props.heightMobile ?? 180;
  const heightDesktop = props.heightDesktop ?? 240;

  const points = useMemo<Point[]>(() => {
    // ✅ Discriminante definitivo (não retorna undefined)
    if ("values" in props) {
      const vals = props.values?.length ? props.values : [0, 0, 0, 0];
      return vals.map((y, i) => ({ x: String(i + 1), y: Number(y) || 0 }));
    }

    // props.data sempre existe nesse ramo
    const d = props.data?.length ? props.data : [{ x: "1", y: 0 }];
    return d.map((p, i) => ({
      x: p.x ?? String(i + 1),
      y: Number(p.y) || 0,
    }));
  }, [props]);

  const { path, areaPath } = useMemo(() => {
    const w = 1000;
    const h = 360;

    const ys = points.map((p) => p.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const range = maxY - minY || 1;

    const padX = 40;
    const padY = 28;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    const toX = (i: number) =>
      padX + (innerW * i) / Math.max(1, points.length - 1);

    const toY = (y: number) =>
      padY + innerH - ((y - minY) / range) * innerH;

    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.y)}`)
      .join(" ");

    const baseY = padY + innerH;
    const area = `${line} L ${toX(points.length - 1)} ${baseY} L ${toX(
      0
    )} ${baseY} Z`;

    return { path: line, areaPath: area };
  }, [points]);

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-clip">
      {/* Mobile */}
      <div className="block sm:hidden" style={{ height: heightMobile }}>
        <SparklineSvg path={path} areaPath={areaPath} />
      </div>

      {/* Desktop */}
      <div className="hidden sm:block" style={{ height: heightDesktop }}>
        <SparklineSvg path={path} areaPath={areaPath} />
      </div>
    </div>
  );
}

function SparklineSvg({
  path,
  areaPath,
}: {
  path: string;
  areaPath: string;
}) {
  return (
    <svg
      viewBox="0 0 1000 360"
      className={cn("w-full h-full")}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(139,92,246,0.30)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0.02)" />
        </linearGradient>

        <filter id="sparkGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Área */}
      <path d={areaPath} fill="url(#sparkFill)" />

      {/* Linha */}
      <path
        d={path}
        fill="none"
        stroke="rgba(167, 139, 250, 0.95)"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#sparkGlow)"
      />
    </svg>
  );
}