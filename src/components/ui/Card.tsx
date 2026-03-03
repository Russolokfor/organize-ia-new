"use client";

import { motion } from "framer-motion";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className={[
        "group relative overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/5 backdrop-blur-2xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {/* glow */}
      <div className="pointer-events-none absolute -inset-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,92,255,0.35),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.18),transparent_40%)]" />
      </div>

      {/* top shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative p-7">{children}</div>
    </motion.div>
  );
}