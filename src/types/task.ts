export type TaskStatus = "planned" | "doing" | "done";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;

  priority: number | null;
  duration_min: number | null;

  due_date: string | null;      // "YYYY-MM-DD"
  completed_at: string | null;

  pinned_today: boolean;
  routine_order: number | null;

  created_at: string;
  updated_at: string;
};