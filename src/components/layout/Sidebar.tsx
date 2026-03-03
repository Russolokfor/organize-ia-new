"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Inbox, Calendar, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Hoje", href: "/", icon: LayoutDashboard },
    { name: "Inbox", href: "/inbox", icon: Inbox },
    { name: "Rotina", href: "/routine", icon: Calendar },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className="
        w-64 h-screen fixed left-0 top-0
        border-r border-white/10
        bg-gradient-to-b from-white/5 to-transparent
        backdrop-blur-2xl
        p-8
      "
    >
      <div className="text-lg font-semibold mb-10 tracking-wide">
        Organize<span className="text-purple-400">.ia</span>
      </div>

      <nav className="space-y-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className={[
                  "flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all",
                  active
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-300 hover:bg-white/5",
                ].join(" ")}
              >
                <Icon size={18} />
                <span className="text-sm">{link.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-8 right-8 text-xs text-slate-500">
        v0.1 • Organize.ia
      </div>
    </aside>
  );
}