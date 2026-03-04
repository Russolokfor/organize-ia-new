// src/lib/taskUi.ts
import type { Task } from "@/types/task";
import { todayISO } from "@/lib/date";

export function statusLabel(s: Task["status"]) {
  if (s === "planned") return "Planejada";
  if (s === "doing") return "Em andamento";
  return "Concluída";
}

export function isOverdue(t: Task, tdy: string = todayISO()) {
  if (!t.due_date) return false;
  if (t.status === "done") return false;
  return t.due_date < tdy;
}

export function isTodayTask(t: Task, tdy: string = todayISO()) {
  return t.due_date === tdy || t.pinned_today;
}

export function badgeForTask(t: Task, tdy: string = todayISO()) {
  if (t.status === "done") {
    return {
      text: "Concluída",
      className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
    };
  }
  if (isOverdue(t, tdy)) {
    return {
      text: "Atrasada",
      className: "bg-red-500/15 text-red-300 border border-red-500/25",
    };
  }
  if (t.pinned_today) {
    return {
      text: "Na Rotina",
      className: "bg-blue-500/15 text-blue-300 border border-blue-500/25",
    };
  }
  return null;
}