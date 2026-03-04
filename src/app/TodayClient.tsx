"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TaskList from "@/components/TaskList";
import Card from "@/components/ui/Card";

type RoutineBlock = {
  id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  kind: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: number | null;
  duration_min: number | null;
  created_at: string;
};

type PlanItem = {
  id: string;
  task_id: string | null;
  plan_date: string;
  start_time: string;
  end_time: string;
};

function toPlanDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TodayClient() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);
  const [inboxTasks, setInboxTasks] = useState<Task[]>([]);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      const sessionRes = await supabase.auth.getSession();
      const user = sessionRes.data.session?.user;

      if (!user) {
        if (!cancelled) {
          setErrorMsg("Você precisa estar logado para ver o Hoje.");
          setLoading(false);
        }
        return;
      }

      const now = new Date();
      const planDate = toPlanDateISO(now);
      const dow = now.getDay();

      const blocksRes = await supabase
        .from("routine_blocks")
        .select("id,title,day_of_week,start_time,end_time,kind")
        .eq("user_id", user.id)
        .eq("day_of_week", dow)
        .order("start_time", { ascending: true });

      if (blocksRes.error) {
        if (!cancelled) {
          setErrorMsg(blocksRes.error.message);
          setLoading(false);
        }
        return;
      }

      const inboxRes = await supabase
        .from("tasks")
        .select("id,title,status,priority,duration_min,created_at")
        .eq("user_id", user.id)
        .eq("status", "inbox")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (inboxRes.error) {
        if (!cancelled) {
          setErrorMsg(inboxRes.error.message);
          setLoading(false);
        }
        return;
      }

      const planRes = await supabase
        .from("plan_items")
        .select("id,task_id,plan_date,start_time,end_time")
        .eq("user_id", user.id)
        .eq("plan_date", planDate)
        .order("start_time", { ascending: true });

      if (planRes.error) {
        if (!cancelled) {
          setErrorMsg(planRes.error.message);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setBlocks((blocksRes.data ?? []) as RoutineBlock[]);
        setInboxTasks((inboxRes.data ?? []) as Task[]);
        setPlanItems((planRes.data ?? []) as PlanItem[]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="p-6">Carregando...</div>;

  if (errorMsg) {
    return (
      <div className="p-6">
        <Card>
          <div className="font-semibold">Erro</div>
          <div className="mt-2 text-sm opacity-80">{errorMsg}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-100">
  Dashboard
</h1>

      {/* Cards topo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <div className="text-sm text-slate-400 mb-2">Tarefas na Inbox</div>
          <div className="text-3xl font-semibold">{inboxTasks.length}</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-400 mb-2">Blocos Hoje</div>
          <div className="text-3xl font-semibold">{blocks.length}</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-400 mb-2">Planejado</div>
          <div className="text-3xl font-semibold">{planItems.length}</div>
        </Card>
      </div>

      {/* Área principal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card>
          <div className="text-lg font-medium mb-4">Inbox</div>
          <TaskList status="inbox" />
        </Card>

        <Card>
          <div className="text-lg font-medium mb-4">Rotina do dia</div>

          <div className="space-y-2 text-sm">
            {blocks.length === 0 ? (
              <div className="text-slate-400">Sem blocos cadastrados para hoje.</div>
            ) : (
              blocks.map((b) => (
                <div key={b.id} className="flex justify-between">
                  <span className="font-medium">{b.title}</span>
                  <span className="text-slate-400">
                    {b.start_time} - {b.end_time}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}