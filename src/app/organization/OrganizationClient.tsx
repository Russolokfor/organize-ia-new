"use client";

import { useEffect, useMemo, useState } from "react";
import { taskService, type TaskFilters } from "@/services/taskService";
import type { Task } from "@/types/task";

type StatusFilter = "all" | "inbox" | "planned" | "doing" | "done";
type ScopeFilter = "all" | "today" | "next7" | "overdue" | "no_due_date";

function isOverdue(t: Task) {
  if (!t.due_date) return false;
  if (t.status === "done") return false;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayISO = `${yyyy}-${mm}-${dd}`;
  return t.due_date < todayISO;
}

export default function OrganizationClient() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Task[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [scope, setScope] = useState<ScopeFilter>("all");

  // criar tarefa
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const filters: TaskFilters = useMemo(() => {
    return {
      status,
      scope,
    };
  }, [status, scope]);

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
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao concluir tarefa.");
    }
  }

  async function pinToday(t: Task) {
    try {
      await taskService.setPinnedToday(t.id, !t.pinned_today);
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
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao excluir tarefa.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="border border-zinc-800 rounded-2xl p-6 shadow-sm bg-zinc-900/30">
        <h1 className="text-lg font-semibold">Organização</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Aqui você gerencia todas as suas tarefas (criar, filtrar, concluir e enviar para a Rotina).
        </p>
      </div>

      {/* Criar tarefa */}
      <form onSubmit={createTask} className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30 grid gap-3">
        <div className="grid gap-2">
          <label className="text-sm text-zinc-300">Nova tarefa</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 outline-none"
            placeholder="Ex: Pagar conta, Treinar, Estudar..."
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-300">Prazo (opcional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 outline-none"
          />
        </div>

        <button
          disabled={creating}
          className="rounded-xl px-4 py-2 bg-zinc-100 text-zinc-950 font-medium disabled:opacity-60"
        >
          {creating ? "Criando..." : "Adicionar tarefa"}
        </button>
      </form>

      {/* filtros */}
      <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30 grid gap-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="grid gap-2">
            <label className="text-sm text-zinc-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">Todos</option>
              <option value="planned">Planejadas</option>
              <option value="doing">Em andamento</option>
              <option value="done">Concluídas</option>
              <option value="inbox">Inbox</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-zinc-300">Prazo</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ScopeFilter)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">Tudo</option>
              <option value="today">Hoje</option>
              <option value="next7">Próximos 7 dias</option>
              <option value="overdue">Atrasadas</option>
              <option value="no_due_date">Sem prazo</option>
            </select>
          </div>
        </div>
      </div>

      {/* lista */}
      <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
        <h2 className="font-semibold">Tarefas</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Dica: use “Rotina” para trabalhar o dia. Aqui é o painel geral.
        </p>

        {loading ? (
          <p className="text-sm text-zinc-400 mt-4">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-400 mt-4">
            Nenhuma tarefa encontrada. Crie a primeira acima.
          </p>
        ) : (
          <div className="mt-4 grid gap-2">
            {items.map((t) => (
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

                    {isOverdue(t) && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        Atrasada
                      </span>
                    )}

                    {t.pinned_today && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Na Rotina
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-zinc-400">
                    Prazo: {t.due_date ?? "sem prazo"} • Status: {t.status}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleDone(t)}
                    className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                  >
                    {t.status === "done" ? "Reabrir" : "Concluir"}
                  </button>

                  <button
                    onClick={() => pinToday(t)}
                    className="px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition text-sm"
                  >
                    {t.pinned_today ? "Remover da Rotina" : "Enviar pra Rotina"}
                  </button>

                  <button
                    onClick={() => removeTask(t)}
                    className="px-3 py-2 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-500/10 transition text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}