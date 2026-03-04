// ─────────────────────────────────────────────────────────────────────────────
// lib/api.ts — Tất cả hàm gọi API tập trung ở đây
// ─────────────────────────────────────────────────────────────────────────────

export interface GamePayload {
  status: "not_started" | "playing" | "ended";
  participants: string[];
  lastSentence: string | null;
  fullStory: { playerName: string; sentence: string }[];
  startTime: Date;
  endTime: Date;
  maxWords: number;
}

export interface SubmitBody {
  playerName: string;
  sentence: string;
  previousSentence: string | null;
}

export interface SubmitError {
  type: "conflict" | "validation" | "server";
  message: string;
  /** Chỉ có khi type === "conflict" */
  latestSentence?: string;
}

// ── GET /api/game ─────────────────────────────────────────────────────────────
export async function fetchGame(): Promise<GamePayload> {
  const res = await fetch("/api/game");
  if (!res.ok) throw new Error("Không thể tải dữ liệu game.");
  return res.json();
}

// ── POST /api/submit ──────────────────────────────────────────────────────────
// Ném SubmitError nếu thất bại để caller xử lý đúng case
export async function submitSentence(body: SubmitBody): Promise<void> {
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 201) return; // thành công

  const data = await res.json().catch(() => ({}));

  if (res.status === 409) {
    const err: SubmitError = {
      type: "conflict",
      message: "Có người vừa viết trước bạn! Hãy viết lại câu nối tiếp.",
      latestSentence: data.latestSentence ?? "",
    };
    throw err;
  }

  if (res.status === 400 || res.status === 403) {
    throw {
      type: "validation",
      message: data.error ?? "Dữ liệu không hợp lệ.",
    } satisfies SubmitError;
  }

  throw {
    type: "server",
    message: "Lỗi máy chủ, thử lại nhé!",
  } satisfies SubmitError;
}
