"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Energy = "high" | "medium" | "low";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: number | null;
  duration_min: number | null;
  energy: Energy;
  created_at: string;
};

type Props = {
  refreshKey?: number;
  status?: string; // default: "inbox"
};

function energyBadge(e: Energy) {
  if (e === "high") return "Alta";
  if (e === "low") return "Baixa";
  return "Média";
}

export default function TaskList({ refreshKey = 0, status = "inbox" }: Props) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ordered = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const pa = a.priority ?? 999;
      const pb = b.priority ?? 999;
      if (pa !== pb) return pa - pb;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [tasks]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("id,title,status,priority,duration_min,energy,created_at")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data ?? []) as TaskRow[]);
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, status]);

  async function markDone(id: string) {
    setErr(null);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("tasks").update({ status: "done" }).eq("id", id);
    if (error) {
      setErr(error.message);
      load();
    }
  }

  async function remove(id: string) {
    setErr(null);
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== id));

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      setErr(error.message);
      setTasks(prev);
    }
  }

  return (
    <div className="space-y-3">
      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-zinc-600">Carregando...</div>
      ) : ordered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
          Nenhuma tarefa no Inbox.
        </div>
      ) : (
        <div className="space-y-2">
          {ordered.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-900">{t.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                  <span className="rounded-md border border-zinc-200 px-2 py-0.5">
                    {t.duration_min ?? 30} min
                  </span>
                  <span className="rounded-md border border-zinc-200 px-2 py-0.5">
                    P{t.priority ?? 3}
                  </span>
                  <span className="rounded-md border border-zinc-200 px-2 py-0.5">
                    Energia: {energyBadge(t.energy)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white"
                  onClick={() => markDone(t.id)}
                >
                  Concluir
                </button>
                <button
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
                  onClick={() => remove(t.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}