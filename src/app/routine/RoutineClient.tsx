"use client";

import { useEffect, useMemo, useState } from "react";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types/task";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function RoutineClient() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Task[]>([]);

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

  const sorted = useMemo(() => {
    const t = todayISO();
    const copy = [...items];

    // Ordena: pinned primeiro, depois routine_order, depois due_date
    copy.sort((a, b) => {
      const ap = a.pinned_today ? 0 : (a.due_date === t ? 1 : 2);
      const bp = b.pinned_today ? 0 : (b.due_date === t ? 1 : 2);

      if (ap !== bp) return ap - bp;

      const ao = a.routine_order ?? 999999;
      const bo = b.routine_order ?? 999999;
      if (ao !== bo) return ao - bo;

      return (a.created_at ?? "").localeCompare(b.created_at ?? "");
    });

    return copy;
  }, [items]);

  async function addToToday(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      await taskService.create({
        title,
        due_date: todayISO(),
        status: "planned",
        pinned_today: true,
        routine_order: Date.now(), // simples e funciona bem
      });
      setTitle("");
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
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao concluir.");
    }
  }

  async function removeFromRoutine(t: Task) {
    try {
      await taskService.setPinnedToday(t.id, false);
      await taskService.setRoutineOrder(t.id, null);
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
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao reordenar.");
    }
  }

  const doneCount = sorted.filter((x) => x.status === "done").length;
  const totalCount = sorted.length;
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="grid gap-4">
      <div className="border border-zinc-800 rounded-2xl p-6 shadow-sm bg-zinc-900/30">
        <h1 className="text-lg font-semibold">Rotina</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Suas tarefas do dia (Hoje + as que você fixou na Rotina).
        </p>

        <div className="mt-3 text-sm text-zinc-400">
          {totalCount === 0 ? "Nenhuma tarefa hoje." : `${doneCount}/${totalCount} concluídas (${pct}%)`}
        </div>
      </div>

      <form onSubmit={addToToday} className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30 grid gap-3">
        <label className="text-sm text-zinc-300">Adicionar tarefa na Rotina (hoje)</label>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 outline-none"
            placeholder="Ex: Fazer 30min de treino"
          />
          <button
            disabled={creating}
            className="rounded-xl px-4 py-2 bg-zinc-100 text-zinc-950 font-medium disabled:opacity-60"
          >
            {creating ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>

      <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
        <h2 className="font-semibold">Hoje</h2>

        {loading ? (
          <p className="text-sm text-zinc-400 mt-4">Carregando...</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-zinc-400 mt-4">
            Nada por aqui. Envie tarefas pela Organização ou crie acima.
          </p>
        ) : (
          <div className="mt-4 grid gap-2">
            {sorted.map((t) => (
              <div
                key={t.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-zinc-800 rounded-2xl p-4 bg-zinc-950/40"
              >
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.title}</span>
                    {t.status === "done" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Concluída
                      </span>
                    )}
                    {t.pinned_today && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Fixada
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">Prazo: {t.due_date ?? "sem prazo"}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => move(t, -1)}
                    className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(t, 1)}
                    className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() => toggleDone(t)}
                    className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                  >
                    {t.status === "done" ? "Reabrir" : "Concluir"}
                  </button>

                  {t.pinned_today && (
                    <button
                      onClick={() => removeFromRoutine(t)}
                      className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                    >
                      Remover da Rotina
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}