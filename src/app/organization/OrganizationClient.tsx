"use client";

import { useEffect, useMemo, useState } from "react";
import { taskService, type TaskFilters } from "@/services/taskService";
import type { Task } from "@/types/task";
import { todayISO } from "@/lib/date";
import { badgeForTask, statusLabel } from "@/lib/taskUi";

type StatusFilter = "all" | "planned" | "doing" | "done";
type ScopeFilter = "all" | "today" | "next7" | "overdue" | "no_due_date";

export default function OrganizationClient() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Task[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [scope, setScope] = useState<ScopeFilter>("all");

  // criar tarefa
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [creating, setCreating] = useState(false);

  // UX: texto curto de status
  const [toast, setToast] = useState<string>("");

  const filters: TaskFilters = useMemo(() => ({ status, scope }), [status, scope]);

  const metrics = useMemo(() => {
    const tdy = todayISO();

    const active = items.filter((t) => t.status !== "done");
    const today = items.filter(
      (t) => (t.due_date === tdy || t.pinned_today) && t.status !== "done"
    );
    const overdue = items.filter(
      (t) => t.due_date && t.due_date < tdy && t.status !== "done"
    );

    return {
      active: active.length,
      today: today.length,
      overdue: overdue.length,
    };
  }, [items]);

  async function load() {
    setLoading(true);
    try {
      const data = await taskService.list(filters);
      setItems(data);
    } catch (e: any) {
      alert(e?.message ?? "Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, scope]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      await taskService.create({
        title,
        due_date: dueDate ? dueDate : null,
        status: "planned",
      });
      setTitle("");
      setDueDate("");
      flash("Tarefa criada.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao criar tarefa.");
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
      alert(e?.message ?? "Erro ao concluir tarefa.");
    }
  }

  async function pinToday(t: Task) {
    try {
      await taskService.setPinnedToday(t.id, !t.pinned_today);
      flash(t.pinned_today ? "Removida da Rotina." : "Enviada para a Rotina.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao enviar para a Rotina.");
    }
  }

  async function removeTask(t: Task) {
    const ok = confirm("Excluir esta tarefa?");
    if (!ok) return;

    try {
      await taskService.remove(t.id);
      flash("Tarefa excluída.");
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao excluir tarefa.");
    }
  }

  return (
    <div className="grid gap-6">
      {/* HEADER */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Organização</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Painel geral para criar, filtrar e priorizar o que você vai executar hoje.
              </p>
            </div>

            {toast ? (
              <div className="text-xs text-zinc-300 border border-zinc-800 bg-zinc-950/40 rounded-2xl px-3 py-2">
                {toast}
              </div>
            ) : (
              <div className="text-xs text-zinc-500">
                Dica: envie para a Rotina e execute lá.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Ativas</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.active}</p>
          <p className="mt-2 text-sm text-zinc-400">Tudo que ainda não foi concluído.</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Hoje</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.today}</p>
          <p className="mt-2 text-sm text-zinc-400">Prazo hoje ou fixadas na Rotina.</p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Atrasadas</p>
          <p className="mt-2 text-3xl font-semibold">{metrics.overdue}</p>
          <p className="mt-2 text-sm text-zinc-400">Vencidas e ainda abertas.</p>
        </div>
      </div>

      {/* CREATE + FILTERS */}
      <div className="grid gap-3 lg:grid-cols-5">
        {/* CREATE */}
        <form
          onSubmit={createTask}
          className="lg:col-span-3 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Nova tarefa</h2>
            <span className="text-xs text-zinc-500">rápido e direto</span>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-zinc-600 transition"
              placeholder="Ex: Revisar proposta, Treinar, Estudar 30min..."
            />

            <div className="grid gap-2">
              <label className="text-xs text-zinc-500">Prazo (opcional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-zinc-600 transition"
              />
            </div>

            <button
              disabled={creating}
              className="rounded-2xl px-4 py-3 bg-zinc-100 text-zinc-950 font-medium disabled:opacity-60 hover:opacity-95 transition"
            >
              {creating ? "Criando..." : "Adicionar tarefa"}
            </button>
          </div>
        </form>

        {/* FILTERS */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="font-semibold">Filtros</h2>
          <p className="text-sm text-zinc-400 mt-1">Encontre rápido o que importa agora.</p>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-2">
              <label className="text-xs text-zinc-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-zinc-600 transition"
              >
                <option value="all">Todos</option>
                <option value="planned">Planejadas</option>
                <option value="doing">Em andamento</option>
                <option value="done">Concluídas</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-zinc-500">Prazo</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as ScopeFilter)}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-zinc-600 transition"
              >
                <option value="all">Tudo</option>
                <option value="today">Hoje</option>
                <option value="next7">Próximos 7 dias</option>
                <option value="overdue">Atrasadas</option>
                <option value="no_due_date">Sem prazo</option>
              </select>
            </div>

            <div className="text-xs text-zinc-500">
              Total exibido:{" "}
              <span className="text-zinc-300 font-medium">
                {loading ? "..." : items.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold">Tarefas</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Clique para concluir, enviar para a Rotina ou excluir.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400 mt-6">Carregando...</p>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-6">
            <p className="text-sm text-zinc-300 font-medium">Nada por aqui ainda.</p>
            <p className="text-sm text-zinc-500 mt-1">
              Crie sua primeira tarefa acima e envie para a Rotina quando quiser executar.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-2">
            {items.map((t) => {
              const badge = badgeForTask(t);

              return (
                <div
                  key={t.id}
                  className="group rounded-3xl border border-zinc-800 bg-zinc-950/25 hover:bg-zinc-950/40 transition p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium truncate">{t.title}</span>

                        {badge && (
                          <span className={`text-xs px-2 py-1 rounded-full ${badge.className}`}>
                            {badge.text}
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
                        onClick={() => toggleDone(t)}
                        className="px-3 py-2 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                      >
                        {t.status === "done" ? "Reabrir" : "Concluir"}
                      </button>

                      <button
                        onClick={() => pinToday(t)}
                        className="px-3 py-2 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                      >
                        {t.pinned_today ? "Remover da Rotina" : "Enviar pra Rotina"}
                      </button>

                      <button
                        onClick={() => removeTask(t)}
                        className="px-3 py-2 rounded-2xl border border-red-500/40 text-red-300 hover:bg-red-500/10 transition text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}