"use client";

import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { x: string; y: number };

export default function AreaSparkline({
  data,
  heightMobile = 180,
  heightDesktop = 240,
}: {
  data: Point[];
  heightMobile?: number;
  heightDesktop?: number;
}) {
  return (
    <div className="w-full max-w-full min-w-0 overflow-x-clip">
      {/* ✅ altura menor no mobile */}
      <div className="block sm:hidden" style={{ height: heightMobile }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
            <XAxis dataKey="x" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="y" strokeWidth={3} fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="hidden sm:block" style={{ height: heightDesktop }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <XAxis dataKey="x" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="y" strokeWidth={3} fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}