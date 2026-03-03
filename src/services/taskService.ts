import { supabase } from "@/lib/supabaseClient";
import type { Task, TaskStatus } from "@/types/task";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type TaskFilters = {
  status?: TaskStatus | "all";
  scope?: "all" | "today" | "next7" | "overdue" | "no_due_date";
};

export const taskService = {
  async getUserId(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) throw new Error("Você precisa estar logado.");
    return userId;
  },

  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const userId = await this.getUserId();

    let q = supabase.from("tasks").select("*").eq("user_id", userId);

    if (filters.status && filters.status !== "all") {
      q = q.eq("status", filters.status);
    }

    const t = todayISO();

    if (filters.scope === "today") {
      q = q.or(`due_date.eq.${t},pinned_today.eq.true`);
    }

    if (filters.scope === "overdue") {
      q = q.lt("due_date", t).neq("status", "done");
    }

    if (filters.scope === "no_due_date") {
      q = q.is("due_date", null);
    }

    if (filters.scope === "next7") {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const t7 = `${yyyy}-${mm}-${dd}`;
      q = q.gte("due_date", t).lte("due_date", t7);
    }

    q = q
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    const { data, error } = await q;
    if (error) throw error;

    return (data ?? []) as Task[];
  },

  async create(payload: {
    title: string;
    notes?: string | null;
    due_date?: string | null;
    status?: TaskStatus;
    priority?: number | null;
    duration_min?: number | null;

    pinned_today?: boolean;
    routine_order?: number | null;
  }): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await supabase.from("tasks").insert({
      user_id: userId,
      title: payload.title.trim(),
      notes: payload.notes ?? null,
      due_date: payload.due_date ?? null,
      status: payload.status ?? "planned",
      priority: payload.priority ?? 3,
      duration_min: payload.duration_min ?? 30,

      pinned_today: payload.pinned_today ?? false,
      routine_order: payload.routine_order ?? null,

      completed_at: null,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  },

  async update(id: string, patch: Partial<Task>): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await supabase
      .from("tasks")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const userId = await this.getUserId();

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async toggleDone(id: string, done: boolean): Promise<void> {
    if (done) {
      await this.update(id, { status: "done", completed_at: new Date().toISOString() } as any);
    } else {
      await this.update(id, { status: "planned", completed_at: null } as any);
    }
  },

  async setPinnedToday(id: string, pinned: boolean): Promise<void> {
    await this.update(id, { pinned_today: pinned } as any);
  },

  async setRoutineOrder(id: string, routine_order: number | null): Promise<void> {
    await this.update(id, { routine_order } as any);
  },
};