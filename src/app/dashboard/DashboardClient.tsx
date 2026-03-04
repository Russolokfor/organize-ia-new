"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Task } from "@/types/task";
import { taskService } from "@/services/taskService";
import KpiCard from "@/components/ui/KpiCard";
import AreaSparkline from "@/components/ui/AreaSparkline";
import { todayISO, daysAgoISO } from "@/lib/date";

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    setLoading(true);
    try {
      const data = await taskService.list({ status: "all", scope: "all" });
      setTasks(data);
    } catch (e: any) {
      alert(e?.message ?? "Erro ao carregar dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const tdy = useMemo(() => todayISO(), []);
  const stats = useMemo(() => {
    const active = tasks.filter((t) => t.status !== "done");
    const done = tasks.filter((t) => t.status === "done");
    const overdue = tasks.filter((t) => t.due_date && t.due_date < tdy && t.status !== "done");
    const today = tasks.filter((t) => (t.due_date === tdy || t.pinned_today) && t.status !== "done");

    // “taxa 7d” simples: concluídas / criadas nos últimos 7 dias
    const start7 = daysAgoISO(7);
    const created7 = tasks.filter((t) => t.created_at.slice(0, 10) >= start7);
    const done7 = tasks.filter((t) => (t.completed_at ? t.completed_at.slice(0, 10) >= start7 : false));
    const rate7 = created7.length === 0 ? 0 : Math.round((done7.length / created7.length) * 100);

    return { active: active.length, done: done.length, overdue: overdue.length, today: today.length, rate7 };
  }, [tasks, tdy]);

  const chart = useMemo(() => {
    // concluídas por dia (últimos 14 dias)
    const days = 14;
    const start = daysAgoISO(days - 1);
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgoISO(i);
      labels.push(d);
      const v = tasks.filter((t) => t.completed_at && t.completed_at.slice(0, 10) === d).length;
      values.push(v);
    }

    const total = values.reduce((a, b) => a + b, 0);
    return { labels, values, total, start };
  }, [tasks]);

  const focusToday = useMemo(() => {
    return tasks
      .filter((t) => (t.due_date === tdy || t.pinned_today) && t.status !== "done")
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
      .slice(0, 8);
  }, [tasks, tdy]);

  const overdueList = useMemo(() => {
    return tasks
      .filter((t) => t.due_date && t.due_date < tdy && t.status !== "done")
      .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
      .slice(0, 6);
  }, [tasks, tdy]);

  async function markDone(id: string) {
    try {
      await taskService.toggleDone(id, true);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao concluir.");
    }
  }

  return (
    <div className="grid gap-5">
      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ativas" value={loading ? "…" : stats.active} hint="Ainda não finalizadas" accent="violet" />
        <KpiCard label="Hoje" value={loading ? "…" : stats.today} hint="Prazo hoje ou fixadas" accent="blue" />
        <KpiCard label="Atrasadas" value={loading ? "…" : stats.overdue} hint="Vencidas e abertas" accent="red" />
        <KpiCard label="Taxa 7d" value={loading ? "…" : `${stats.rate7}%`} hint="Concluídas / Criadas" accent="emerald" />
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        {/* Gráfico */}
        <div className="panel p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">Execução</div>
              <div className="text-lg font-semibold tracking-tight">Concluídas por dia</div>
              <div className="text-sm text-zinc-400 mt-1">
                Últimos 14 dias • total: <span className="text-zinc-200 font-medium">{chart.total}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/performance"
                className="rounded-2xl px-4 py-2 border border-zinc-800/60 bg-zinc-950/20 hover:bg-zinc-950/35 transition text-sm"
              >
                Ver desempenho
              </Link>
              <Link
                href="/organization"
                className="rounded-2xl px-4 py-2 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/15 transition text-sm"
              >
                Nova tarefa
              </Link>
            </div>
          </div>

          <div className="mt-5 panel-soft p-4">
            <AreaSparkline values={chart.values.length ? chart.values : [0, 0, 0, 0]} />
            <div className="mt-3 text-xs text-zinc-500">
              Começo: <span className="text-zinc-300">{chart.start}</span> • Hoje:{" "}
              <span className="text-zinc-300">{tdy}</span>
            </div>
          </div>
        </div>

        {/* Hoje */}
        <div className="panel p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">Foco</div>
              <div className="text-lg font-semibold tracking-tight">Hoje</div>
              <div className="text-sm text-zinc-400 mt-1">O que merece sua atenção agora.</div>
            </div>

            <Link
              href="/routine"
              className="rounded-2xl px-4 py-2 border border-zinc-800/60 bg-zinc-950/20 hover:bg-zinc-950/35 transition text-sm"
            >
              Ir para Rotina
            </Link>
          </div>

          {loading ? (
            <div className="mt-5 text-sm text-zinc-400">Carregando…</div>
          ) : focusToday.length === 0 ? (
            <div className="mt-5 panel-soft p-5">
              <div className="text-sm font-medium text-zinc-200">Sem foco definido.</div>
              <div className="text-sm text-zinc-500 mt-1">
                Envie tarefas para a Rotina ou defina prazo para hoje.
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-2">
              {focusToday.map((t) => (
                <div key={t.id} className="panel-soft p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Prazo: <span className="text-zinc-300">{t.due_date ?? "—"}</span>
                      {t.pinned_today ? (
                        <>
                          {" • "}
                          <span className="text-violet-300">Fixada</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => markDone(t.id)}
                    className="shrink-0 rounded-2xl px-3 py-2 border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15 transition text-sm text-emerald-200"
                  >
                    Concluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Atrasadas */}
      <div className="panel p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500">Alerta</div>
            <div className="text-lg font-semibold tracking-tight">Atrasadas</div>
            <div className="text-sm text-zinc-400 mt-1">
              Trate isso primeiro para liberar sua execução.
            </div>
          </div>

          <Link
            href="/organization"
            className="rounded-2xl px-4 py-2 border border-zinc-800/60 bg-zinc-950/20 hover:bg-zinc-950/35 transition text-sm"
          >
            Ver na Organização
          </Link>
        </div>

        {loading ? (
          <div className="mt-5 text-sm text-zinc-400">Carregando…</div>
        ) : overdueList.length === 0 ? (
          <div className="mt-5 panel-soft p-5">
            <div className="text-sm font-medium text-zinc-200">Nada atrasado 🎉</div>
            <div className="text-sm text-zinc-500 mt-1">
              Você está em dia. Mantenha poucos itens no foco.
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-2 md:grid-cols-2">
            {overdueList.map((t) => (
              <div key={t.id} className="panel-soft p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Prazo: <span className="text-red-300">{t.due_date}</span>
                  </div>
                </div>

                <button
                  onClick={() => markDone(t.id)}
                  className="shrink-0 rounded-2xl px-3 py-2 border border-zinc-800/60 bg-zinc-950/20 hover:bg-zinc-950/35 transition text-sm"
                >
                  Marcar feita
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}