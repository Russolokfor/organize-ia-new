// src/lib/date.ts
export function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(days: number, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysAgoISO(days: number, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return toISODate(d);
}