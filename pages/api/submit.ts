import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import GameData from "@/models/GameData";
import GameConfig from "@/models/GameConfig";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Returns Vietnam local time as a Date (UTC+7) */
function getVietnamTime(): Date {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface SubmitBody {
  playerName: string;
  sentence: string;
  /** The last sentence the player saw on their screen before submitting */
  previousSentence: string | null;
}

interface SuccessPayload {
  message: string;
  playerName: string;
  sentence: string;
}

interface ConflictPayload {
  error: "conflict";
  latestSentence: string;
}

// ──────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessPayload | ConflictPayload | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ─── 1. Get active game config ────────────────
  const gameConfig = await GameConfig.findOne({ isActive: true }).lean();

  if (!gameConfig) {
    return res.status(500).json({ error: "Game config not found" });
  }

  // ─── 2. Time validation ───────────────────────
  const vnNow = getVietnamTime();
  const startTime = new Date(new Date(gameConfig.startTime).toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  const endTime = new Date(new Date(gameConfig.endTime).toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));

  if (vnNow < startTime || vnNow >= endTime) {
    return res.status(403).json({
      error: `Submissions are only allowed between ${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} and ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.`,
    });
  }

  // ─── 2. Data validation ───────────────────────
  const { playerName, sentence, previousSentence } =
    (req.body as SubmitBody) ?? {};

  if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
    return res.status(400).json({ error: "playerName is required." });
  }

  if (!sentence || typeof sentence !== "string" || !sentence.trim()) {
    return res.status(400).json({ error: "sentence is required." });
  }

  if (countWords(sentence) > 20) {
    return res
      .status(400)
      .json({ error: "Sentence must not exceed 20 words." });
  }

  try {
    await connectToDatabase();

    // ─── 3. Race-condition check ───────────────
    // GET the very latest record from the DB
    const latestRow = await GameData.findOne({})
      .sort({ timestamp: -1 })
      .select("sentence -_id")
      .lean();

    const latestSentence = latestRow ? latestRow.sentence : null;

    // The client sends what they think the latest sentence is.
    // If it no longer matches, someone else submitted in between → 409.
    if (latestSentence !== (previousSentence ?? null)) {
      return res.status(409).json({
        error: "conflict",
        latestSentence: latestSentence ?? "",
      });
    }

    // ─── 4. Insert new entry ───────────────────
    await GameData.create({
      playerName: playerName.trim(),
      sentence: sentence.trim(),
    });

    return res.status(201).json({
      message: "Sentence submitted successfully.",
      playerName: playerName.trim(),
      sentence: sentence.trim(),
    });
  } catch (error) {
    console.error("[POST /api/submit] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
