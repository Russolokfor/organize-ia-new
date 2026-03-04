"use client";

import { useEffect, useMemo, useState } from "react";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/task";
import { todayISO } from "@/lib/date";
import { isTodayTask, statusLabel } from "@/lib/taskUi";

export default function RoutineClient() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Task[]>([]);
  const [toast, setToast] = useState("");

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await taskService.list({ status: "all", scope: "today" });
      setItems(data);
    } catch (e: any) {
      alert(e?.message ?? "Erro ao carregar Rotina.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  }

  const tdy = useMemo(() => todayISO(), []);
  const sorted = useMemo(() => {
    const copy = [...items];

    // 1) Hoje (due_date=today) ou pinned
    // 2) pinned primeiro
    // 3) routine_order
    // 4) created_at
    copy.sort((a, b) => {
      const aIs = isTodayTask(a, tdy) ? 0 : 1;
      const bIs = isTodayTask(b, tdy) ? 0 : 1;
      if (aIs !== bIs) return aIs - bIs;

      const ap = a.pinned_today ? 0 : 1;
      const bp = b.pinned_today ? 0 : 1;
      if (ap !== bp) return ap - bp;

      const ao = a.routine_order ?? 999999999;
      const bo = b.routine_order ?? 999999999;
      if (ao !== bo) return ao - bo;

      return (a.created_at ?? "").localeCompare(b.created_at ?? "");
    });

    return copy;
  }, [items, tdy]);

  const stats = useMemo(() => {
    const todayList = sorted.filter((t) => isTodayTask(t, tdy));
    const total = todayList.length;
    const done = todayList.filter((t) => t.status === "done").length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    const pinned = todayList.filter((t) => t.pinned_today).length;

    return { total, done, pct, pinned };
  }, [sorted, tdy]);

  async function addToToday(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      await taskService.create({
        title,
        due_date: tdy,
        status: "planned",
        pinned_today: true,
        routine_order: Date.now(),
      });
      setTitle("");
      flash("Adicionada na Rotina.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao criar tarefa na Rotina.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleDone(t: Task) {
    try {
      await taskService.toggleDone(t.id, t.status !== "done");
      flash(t.status === "done" ? "Tarefa reaberta." : "Tarefa concluída.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao concluir.");
    }
  }

  async function removeFromRoutine(t: Task) {
    try {
      await taskService.setPinnedToday(t.id, false);
      await taskService.setRoutineOrder(t.id, null);
      flash("Removida da Rotina.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao remover da Rotina.");
    }
  }

  async function move(t: Task, dir: -1 | 1) {
    const idx = sorted.findIndex((x) => x.id === t.id);
    const other = sorted[idx + dir];
    if (!other) return;

    try {
      const a = t.routine_order ?? Date.now();
      const b = other.routine_order ?? Date.now() + 1;

      await taskService.setRoutineOrder(t.id, b);
      await taskService.setRoutineOrder(other.id, a);

      flash("Ordem atualizada.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao reordenar.");
    }
  }

  async function clearPinnedToday() {
    const pinned = sorted.filter((t) => t.pinned_today);
    if (pinned.length === 0) {
      flash("Nada fixado para limpar.");
      return;
    }

    const ok = confirm("Remover todas as tarefas fixadas da Rotina?");
    if (!ok) return;

    try {
      for (const t of pinned) {
        await taskService.setPinnedToday(t.id, false);
        await taskService.setRoutineOrder(t.id, null);
      }
      flash("Rotina limpa.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao limpar Rotina.");
    }
  }

  const progressWidth = `${stats.pct}%`;

  return (
    <div className="grid gap-6">
      {/* HEADER */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Rotina</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Seu centro de execução: foque no que é hoje e finalize o dia.
            </p>
          </div>

          {toast ? (
            <div className="text-xs text-zinc-300 border border-zinc-800 bg-zinc-950/40 rounded-2xl px-3 py-2">
              {toast}
            </div>
          ) : (
            <div className="text-xs text-zinc-500">
              {stats.total === 0 ? "Sem tarefas para hoje." : `${stats.done}/${stats.total} concluídas`}
            </div>
          )}
        </div>

        {/* PROGRESS */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Progresso do dia</span>
            <span className="text-zinc-300 font-medium">{stats.pct}%</span>
          </div>

          <div className="mt-2 h-3 rounded-full bg-zinc-800 overflow-hidden border border-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500/70 transition-all duration-300"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            Fixadas na Rotina: <span className="text-zinc-300 font-medium">{stats.pinned}</span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="grid gap-3 lg:grid-cols-5">
        {/* ADD */}
        <form
          onSubmit={addToToday}
          className="lg:col-span-3 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Adicionar na Rotina</h2>
            <span className="text-xs text-zinc-500">hoje</span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-zinc-600 transition"
              placeholder="Ex: 30min de treino, Revisar orçamento..."
            />

            <button
              disabled={creating}
              className="rounded-2xl px-4 py-3 bg-zinc-100 text-zinc-950 font-medium disabled:opacity-60 hover:opacity-95 transition"
            >
              {creating ? "Adicionando..." : "Adicionar"}
            </button>
          </div>

          <p className="text-sm text-zinc-400 mt-3">
            Dica: você também pode enviar tarefas pela aba Organização.
          </p>
        </form>

        {/* QUICK */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="font-semibold">Ações rápidas</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Limpe fixadas, e mantenha o dia simples.
          </p>

          <div className="mt-4 grid gap-2">
            <button
              onClick={clearPinnedToday}
              className="px-4 py-3 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
            >
              Limpar tarefas fixadas
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold">Hoje</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Reordene, conclua e mantenha o foco.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400 mt-6">Carregando...</p>
        ) : sorted.filter((t) => isTodayTask(t, tdy)).length === 0 ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-6">
            <p className="text-sm text-zinc-300 font-medium">Nada por aqui ainda.</p>
            <p className="text-sm text-zinc-500 mt-1">
              Adicione uma tarefa acima ou envie pela Organização.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-2">
            {sorted
              .filter((t) => isTodayTask(t, tdy))
              .map((t) => (
                <div
                  key={t.id}
                  className="group rounded-3xl border border-zinc-800 bg-zinc-950/25 hover:bg-zinc-950/40 transition p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium truncate">{t.title}</span>

                        {t.status === "done" && (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            Concluída
                          </span>
                        )}

                        {t.pinned_today && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                            Fixada
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-zinc-500">
                        Status: <span className="text-zinc-300">{statusLabel(t.status)}</span>
                        {" • "}
                        Prazo: <span className="text-zinc-300">{t.due_date ?? "sem prazo"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button
                        onClick={() => move(t, -1)}
                        className="px-3 py-2 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                        title="Subir"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(t, 1)}
                        className="px-3 py-2 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                        title="Descer"
                      >
                        ↓
                      </button>

                      <button
                        onClick={() => toggleDone(t)}
                        className="px-3 py-2 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                      >
                        {t.status === "done" ? "Reabrir" : "Concluir"}
                      </button>

                      {t.pinned_today && (
                        <button
                          onClick={() => removeFromRoutine(t)}
                          className="px-3 py-2 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                        >
                          Remover da Rotina
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* FOOT NOTE */}
      <div className="text-xs text-zinc-500">
        Sugestão: mantenha poucas tarefas fixadas (5–8). Menos tarefas = mais execução.
      </div>
    </div>
  );
}