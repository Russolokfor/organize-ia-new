"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Energy = "high" | "medium" | "low";

type Preferences = {
  user_id: string;
  wake_time: string;
  sleep_time: string;
  focus_start: string | null;
  focus_end: string | null;
  morning_energy: Energy;
  afternoon_energy: Energy;
  night_energy: Energy;
  daily_work_minutes: number;
};

type Block = {
  id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  kind: "busy" | "free";
};

type Task = {
  id: string;
  title: string;
  status: "inbox" | "planned" | "doing" | "done";
  priority: number;
  duration_min: number;
  created_at: string;
};

type PlanRow = {
  id: string;
  task_id: string;
  plan_date: string;
  start_time: string;
  end_time: string;
};

type PlanItem = PlanRow & {
  title: string;
};

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function normalizeTime(t: string | null | undefined) {
  if (!t) return "";
  return t.slice(0, 5); // "HH:MM"
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dowToday() {
  return new Date().getDay(); // 0..6
}

type Interval = { start: number; end: number };

function subtractIntervals(base: Interval[], busy: Interval[]) {
  let free = [...base];
  for (const b of busy) {
    const next: Interval[] = [];
    for (const f of free) {
      if (b.end <= f.start || b.start >= f.end) {
        next.push(f);
      } else {
        if (b.start > f.start) next.push({ start: f.start, end: b.start });
        if (b.end < f.end) next.push({ start: b.end, end: f.end });
      }
    }
    free = next;
  }
  return free.sort((a, b) => a.start - b.start);
}

export default function TodayClient() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [inbox, setInbox] = useState<Task[]>([]);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);

  const planDate = useMemo(() => todayISODate(), []);
  const dow = useMemo(() => dowToday(), []);

  const dayWindow = useMemo(() => {
    const wake = normalizeTime(prefs?.wake_time) || "07:00";
    const sleep = normalizeTime(prefs?.sleep_time) || "23:00";
    const focusS = normalizeTime(prefs?.focus_start);
    const focusE = normalizeTime(prefs?.focus_end);

    const start = focusS && focusE ? focusS : wake;
    const end = focusS && focusE ? focusE : sleep;
    return { start, end };
  }, [prefs]);

  async function loadAll() {
    setLoading(true);

    const sessionRes = await supabase.auth.getSession();
    const user = sessionRes.data.session?.user;
    if (!user) {
      setLoading(false);
      return;
    }

    // 1) prefs
    const prefsRes = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prefsRes.error) alert(prefsRes.error.message);
    setPrefs((prefsRes.data as Preferences | null) ?? null);

    // 2) blocks for today
    const blocksRes = await supabase
      .from("routine_blocks")
      .select("id,title,day_of_week,start_time,end_time,kind")
      .eq("day_of_week", dow)
      .order("start_time", { ascending: true });

    if (blocksRes.error) alert(blocksRes.error.message);
    setBlocks((blocksRes.data as Block[]) ?? []);

    // 3) inbox tasks
    const inboxRes = await supabase
      .from("tasks")
      .select("id,title,status,priority,duration_min,created_at")
      .eq("status", "inbox")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (inboxRes.error) alert(inboxRes.error.message);
    setInbox((inboxRes.data as Task[]) ?? []);

    // 4) plan_items (NO join)
    const planRes = await supabase
      .from("plan_items")
      .select("id,task_id,plan_date,start_time,end_time")
      .eq("plan_date", planDate)
      .order("start_time", { ascending: true });

    if (planRes.error) {
      alert(planRes.error.message);
      setPlan([]);
      setLoading(false);
      return;
    }

    const rows = (planRes.data as PlanRow[]) ?? [];
    if (rows.length === 0) {
      setPlan([]);
      setLoading(false);
      return;
    }

    // 5) fetch task titles for those plan rows
    const taskIds = rows.map((r) => r.task_id);
    const tasksRes = await supabase.from("tasks").select("id,title").in("id", taskIds);

    if (tasksRes.error) {
      alert(tasksRes.error.message);
      // fallback: show generic titles
      setPlan(rows.map((r) => ({ ...r, title: "Tarefa" })));
      setLoading(false);
      return;
    }

    const map: Record<string, string> = Object.fromEntries(
      (tasksRes.data ?? []).map((t: any) => [t.id, t.title])
    );

    const finalPlan: PlanItem[] = rows.map((r) => ({
      ...r,
      title: map[r.task_id] ?? "Tarefa",
    }));

    setPlan(finalPlan);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function organizeMyDay() {
    setPlanning(true);

    try {
      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;
      if (!user) throw new Error("Você precisa estar logado.");
      if (!prefs) throw new Error("Configure sua Rotina antes (aba Rotina).");

      // limpar plano do dia
      await supabase.from("plan_items").delete().eq("plan_date", planDate);

      // construir janelas livres
      const base: Interval[] = [
        { start: toMinutes(dayWindow.start), end: toMinutes(dayWindow.end) },
      ];

      const busy: Interval[] = blocks
        .filter((b) => b.kind === "busy")
        .map((b) => ({
          start: toMinutes(normalizeTime(b.start_time)),
          end: toMinutes(normalizeTime(b.end_time)),
        }));

      const free = subtractIntervals(base, busy);

      // ordenar tarefas (MVP): prioridade primeiro, depois maior duração
      const tasks = [...inbox].sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority; // 1 antes
        return b.duration_min - a.duration_min;
      });

      let remaining = prefs.daily_work_minutes ?? 240;

      const inserts: Array<{
        user_id: string;
        task_id: string;
        plan_date: string;
        start_time: string;
        end_time: string;
      }> = [];

      const plannedTaskIds: string[] = [];

      let taskIdx = 0;

      for (const slot of free) {
        let cursor = slot.start;

        while (cursor < slot.end && taskIdx < tasks.length && remaining > 0) {
          const t = tasks[taskIdx];

          // não divide tarefa no MVP: só encaixa se couber inteira no slot e no limite
          const dur = t.duration_min;

          if (dur > remaining) break;

          const end = cursor + dur;

          if (end <= slot.end) {
            inserts.push({
              user_id: user.id,
              task_id: t.id,
              plan_date: planDate,
              start_time: toHHMM(cursor),
              end_time: toHHMM(end),
            });

            plannedTaskIds.push(t.id);
            remaining -= dur;
            cursor = end;
            taskIdx++;
          } else {
            break; // não cabe nesse slot, tenta no próximo
          }
        }

        if (taskIdx >= tasks.length || remaining <= 0) break;
      }

      if (inserts.length === 0) {
        alert("Sem espaço livre hoje (ou tarefas não cabem nos slots). Ajuste blocos/rotina ou durações.");
        return;
      }

      const ins = await supabase.from("plan_items").insert(inserts);
      if (ins.error) throw ins.error;

      const upd = await supabase.from("tasks").update({ status: "planned" }).in("id", plannedTaskIds);
      if (upd.error) throw upd.error;

      await loadAll();
    } catch (err: any) {
      alert(err.message ?? "Erro ao organizar o dia.");
    } finally {
      setPlanning(false);
    }
  }

  if (loading) return <p className="text-sm text-zinc-500">Carregando…</p>;

  return (
    <div className="grid gap-4">
      <div className="border rounded-2xl p-6 shadow-sm flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Hoje</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {DOW[dow]} • Janela: {dayWindow.start}–{dayWindow.end} • Blocos fixos hoje:{" "}
            {blocks.length}
          </p>
        </div>

        <button
          onClick={organizeMyDay}
          disabled={planning}
          className="shrink-0 bg-black text-white rounded-xl px-4 py-2 disabled:opacity-60"
        >
          {planning ? "Organizando..." : "Organizar meu dia"}
        </button>
      </div>

      <div className="border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold">Agenda (time-blocking)</h2>
        <p className="text-sm text-zinc-500 mt-1">O plano gerado para hoje.</p>

        {plan.length === 0 ? (
          <div className="mt-4 text-sm text-zinc-500">
            Nenhum plano ainda. Clique em “Organizar meu dia”.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {plan.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-xl p-3">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500">
                    {normalizeTime(p.start_time)}–{normalizeTime(p.end_time)}
                  </div>
                  <div className="truncate">{p.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold">Inbox (pendentes)</h2>
        <p className="text-sm text-zinc-500 mt-1">Tarefas elegíveis para entrar no seu dia.</p>

        {inbox.length === 0 ? (
          <div className="mt-4 text-sm text-zinc-500">
            Inbox vazio. Adicione tarefas em “Inbox”.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {inbox.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between border rounded-xl p-3">
                <div className="truncate">{t.title}</div>
                <span className="text-xs text-zinc-500">
                  P{t.priority} • {t.duration_min}min
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}