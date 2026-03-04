// ─────────────────────────────────────────────────────────────────────────────
// Shared Types
// ─────────────────────────────────────────────────────────────────────────────

export type Screen =
  | "pre-load"
  | "countdown"
  | "welcome"
  | "playing"
  | "submitted"
  | "results";

export interface GamePayload {
  status: "not_started" | "playing" | "ended";
  participants: string[];
  lastSentence: string | null;
  fullStory: { playerName: string; sentence: string }[];
  startTime: Date;
  endTime: Date;
  maxWords: number;
}

export interface ToastItem {
  id: number;
  message: string;
  type: "error" | "success" | "warning";
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert any Date to its Vietnam (UTC+7) equivalent */
export function toVN(date: Date): Date {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60_000;
  return new Date(utcMs + 7 * 3_600_000);
}

export function getVNHour(d: Date): number {
  return toVN(d).getHours();
}

/** ms remaining from `now` until today's `targetHour:00:00` in VN time */
export function msUntilHour(now: Date, targetHour: number): number {
  const vn = toVN(now);
  const target = new Date(vn);
  target.setHours(targetHour, 0, 0, 0);
  return target.getTime() - vn.getTime();
}

export function fmtCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1_000);
  const h = Math.floor(total / 3_600);
  const m = Math.floor((total % 3_600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const MAX_WORDS = 20;

// Pastel palette for story authors
export const AUTHOR_COLORS: Array<[string, string]> = [
  ["rgba(99,102,241,0.12)", "#6366f1"], // indigo
  ["rgba(236,72,153,0.12)", "#ec4899"], // pink
  ["rgba(245,158,11,0.12)", "#f59e0b"], // amber
  ["rgba(16,185,129,0.12)", "#10b981"], // emerald
  ["rgba(139,92,246,0.12)", "#8b5cf6"], // violet
  ["rgba(14,165,233,0.12)", "#0ea5e9"], // sky
  ["rgba(249,115,22,0.12)", "#f97316"], // orange
  ["rgba(20,184,166,0.12)", "#14b8a6"], // teal
  ["rgba(6,182,212,0.12)", "#06b6d4"], // cyan
  ["rgba(132,204,22,0.12)", "#84cc16"], // lime
  ["rgba(168,85,247,0.12)", "#a855f7"], // purple
  ["rgba(239,68,68,0.12)", "#ef4444"], // red
  ["rgba(59,130,246,0.12)", "#3b82f6"], // blue
  ["rgba(34,197,94,0.12)", "#22c55e"], // green
  ["rgba(244,114,182,0.12)", "#f472b6"], // rose
  ["rgba(251,191,36,0.12)", "#fbbf24"], // yellow
  ["rgba(156,163,175,0.12)", "#9ca3af"], // gray
  ["rgba(217,70,239,0.12)", "#d946ef"], // fuchsia
  ["rgba(79,70,229,0.12)", "#4f46e5"], // indigo-dark
  ["rgba(245,101,101,0.12)", "#f56565"], // red-light
  ["rgba(52,211,153,0.12)", "#34d399"], // green-light
  ["rgba(96,165,250,0.12)", "#60a5fa"], // blue-light
  ["rgba(251,146,60,0.12)", "#fb923c"], // orange-light
  ["rgba(196,181,253,0.12)", "#c4b5fd"], // violet-light
];
