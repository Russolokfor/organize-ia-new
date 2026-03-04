// src/services/taskService.ts
import { supabase } from "@/lib/supabaseClient";
import { addDaysISO, todayISO } from "@/lib/date";
import type { Task, TaskStatus } from "@/types/task";

export type TaskFilters = {
  status?: TaskStatus | "all";
  scope?: "all" | "today" | "next7" | "overdue" | "no_due_date";
};

// Só permite atualizar campos que fazem sentido editar pelo app.
// Evita "as any" e evita atualizar id/user_id sem querer.
export type TaskPatch = Partial<
  Pick<
    Task,
    | "title"
    | "notes"
    | "status"
    | "priority"
    | "duration_min"
    | "due_date"
    | "completed_at"
    | "pinned_today"
    | "routine_order"
  >
>;

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
      const t7 = addDaysISO(7);
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

  async update(id: string, patch: TaskPatch): Promise<void> {
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
      await this.update(id, {
        status: "done",
        completed_at: new Date().toISOString(),
      });
    } else {
      await this.update(id, {
        status: "planned",
        completed_at: null,
      });
    }
  },

  async setPinnedToday(id: string, pinned: boolean): Promise<void> {
    await this.update(id, { pinned_today: pinned });
  },

  async setRoutineOrder(id: string, routine_order: number | null): Promise<void> {
    await this.update(id, { routine_order });
  },
};