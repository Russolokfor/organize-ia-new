"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EnergyBadge from "@/components/ui/EnergyBadge";
import { motion } from "framer-motion";

type Props = {
  status?: "inbox" | "planned" | "done" | string;
  refreshKey?: number;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: number | null;
  duration_min: number | null;
  energy: string | null;
  created_at: string;
};

export default function TaskList({ status = "inbox", refreshKey = 0 }: Props) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;

      if (!user) {
        if (!cancelled) {
          setTasks([]);
          setLoading(false);
        }
        return;
      }

      const res = await supabase
        .from("tasks")
        .select("id,title,status,priority,duration_min,energy,created_at")
        .eq("user_id", user.id)
        .eq("status", status)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (res.error) {
        if (!cancelled) {
          setErrorMsg(res.error.message);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setTasks((res.data ?? []) as Task[]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status, refreshKey]);

  if (loading) return <div className="text-sm text-slate-400">Carregando…</div>;

  if (errorMsg) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        Erro: <span className="text-slate-400">{errorMsg}</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <div className="text-sm text-slate-400">Sem tarefas aqui.</div>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((t, idx) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(idx * 0.03, 0.25), duration: 0.25 }}
          className="
            group flex items-start justify-between gap-4
            rounded-2xl border border-white/10 bg-white/4
            px-4 py-3
            hover:bg-white/6 hover:border-white/20
            transition
          "
        >
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-100 truncate">
              {t.title}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {t.duration_min ?? "—"} min • prioridade {t.priority ?? "—"}
            </div>
          </div>

          <div className="shrink-0">
            <EnergyBadge value={t.energy} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}