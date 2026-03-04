"use client";

import { useEffect, useMemo, useState } from "react";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/task";
import { todayISO, daysAgoISO } from "@/lib/date";

type Range = 7 | 30;

export default function PerformanceClient() {
  const [range, setRange] = useState<Range>(7);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    setLoading(true);
    try {
      // carrega todas do usuário e calcula no front (MVP simples)
      const all = await taskService.list({ status: "all", scope: "all" });
      setTasks(all);
    } catch (e: any) {
      alert(e?.message ?? "Erro ao carregar desempenho.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const t = todayISO();
    const start = daysAgoISO(range);

    const active = tasks.filter((x) => x.status !== "done");
    const overdue = tasks.filter((x) => x.due_date && x.due_date < t && x.status !== "done");

    const completedInRange = tasks.filter((x) => {
      if (!x.completed_at) return false;
      const day = x.completed_at.slice(0, 10);
      return day >= start && day <= t;
    });

    // total do período: tarefas criadas no período (MVP)
    const totalInRange = tasks.filter((x) => {
      const day = x.created_at.slice(0, 10);
      return day >= start && day <= t;
    });

    const pctDone =
      totalInRange.length === 0 ? 0 : (completedInRange.length / totalInRange.length) * 100;

    const pctOverdue = active.length === 0 ? 0 : (overdue.length / active.length) * 100;

    return {
      completedInRange: completedInRange.length,
      totalInRange: totalInRange.length,
      pctDone,
      pctOverdue,
      overdueList: overdue
        .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
        .slice(0, 10),
    };
  }, [tasks, range]);

  async function markDone(id: string) {
    try {
      await taskService.toggleDone(id, true);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao concluir.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="border border-zinc-800 rounded-2xl p-6 shadow-sm bg-zinc-900/30">
        <h1 className="text-lg font-semibold">Desempenho</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Veja sua consistência: concluídas, porcentagens e tarefas atrasadas.
        </p>
      </div>

      <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30 flex flex-wrap gap-2">
        <button
          onClick={() => setRange(7)}
          className={`px-3 py-2 rounded-xl border text-sm transition ${
            range === 7
              ? "bg-zinc-100 text-zinc-950 border-zinc-100"
              : "border-zinc-700 hover:bg-zinc-900"
          }`}
        >
          Últimos 7 dias
        </button>
        <button
          onClick={() => setRange(30)}
          className={`px-3 py-2 rounded-xl border text-sm transition ${
            range === 30
              ? "bg-zinc-100 text-zinc-950 border-zinc-100"
              : "border-zinc-700 hover:bg-zinc-900"
          }`}
        >
          Últimos 30 dias
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
              <p className="text-sm text-zinc-400">Concluídas ({range}d)</p>
              <p className="text-3xl font-semibold mt-2">{stats.completedInRange}</p>
              <p className="text-xs text-zinc-500 mt-2">
                Base: {stats.totalInRange} criadas no período
              </p>
            </div>

            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
              <p className="text-sm text-zinc-400">% Concluídas</p>
              <p className="text-3xl font-semibold mt-2">{stats.pctDone.toFixed(0)}%</p>
              <p className="text-xs text-zinc-500 mt-2">Quanto você está fechando do que cria</p>
            </div>

            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
              <p className="text-sm text-zinc-400">% Atrasadas (agora)</p>
              <p className="text-3xl font-semibold mt-2">{stats.pctOverdue.toFixed(0)}%</p>
              <p className="text-xs text-zinc-500 mt-2">Atrasadas / tarefas ativas</p>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
            <h2 className="font-semibold">Atrasadas</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Essas são as principais tarefas que estão vencidas.
            </p>

            {stats.overdueList.length === 0 ? (
              <p className="text-sm text-zinc-400 mt-4">Nenhuma atrasada 🎉</p>
            ) : (
              <div className="mt-4 grid gap-2">
                {stats.overdueList.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 border border-zinc-800 rounded-2xl p-4 bg-zinc-950/40"
                  >
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-zinc-400">Prazo: {t.due_date}</div>
                    </div>
                    <button
                      onClick={() => markDone(t.id)}
                      className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                    >
                      Marcar como feita
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}