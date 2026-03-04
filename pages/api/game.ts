import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import GameData from "@/models/GameData";
import GameConfig from "@/models/GameConfig";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// Response type
// ──────────────────────────────────────────────

type GameStatus = "not_started" | "playing" | "ended";

interface GamePayload {
  status: GameStatus;
  participants: string[];
  lastSentence: string | null;
  fullStory: { playerName: string; sentence: string }[];
  startTime: Date;
  endTime: Date;
  maxWords: number;
}

// ──────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GamePayload | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    // Fetch game config (assuming there's an active config)
    const gameConfig = await GameConfig.findOne({ isActive: true }).lean();

    if (!gameConfig) {
      return res.status(500).json({ error: "Game config not found" });
    }

    const now = new Date();
    const startTime = new Date(gameConfig.startTime);
    const endTime = new Date(gameConfig.endTime);

    // ─── Before start time ───────────────────────────
    if (now < startTime) {
      return res.status(200).json({
        status: "not_started",
        participants: [],
        lastSentence: null,
        fullStory: [],
        startTime: gameConfig.startTime,
        endTime: gameConfig.endTime,
        maxWords: gameConfig.maxWords,
      });
    }

    // ─── During game time (playing) ──────────────
    if (now >= startTime && now < endTime) {
      // Fetch all records sorted by time ascending
      const rows = await GameData.find({})
        .sort({ timestamp: 1 })
        .select("playerName sentence -_id")
        .lean();

      const participants = [...new Set(rows.map((r) => r.playerName))];
      const lastSentence =
        rows.length > 0 ? rows[rows.length - 1].sentence : null;

      return res.status(200).json({
        status: "playing",
        participants,
        lastSentence,
        fullStory: [],
        startTime: gameConfig.startTime,
        endTime: gameConfig.endTime,
        maxWords: gameConfig.maxWords,
      });
    }

    // ─── After end time (ended) ──────────────────
    // Cache aggressively – no more DB writes expected after end time
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400",
    );

    const rows = await GameData.find({})
      .sort({ timestamp: 1 })
      .select("playerName sentence -_id")
      .lean();

    const participants = [...new Set(rows.map((r) => r.playerName))];
    const lastSentence =
      rows.length > 0 ? rows[rows.length - 1].sentence : null;

    return res.status(200).json({
      status: "ended",
      participants,
      lastSentence,
      fullStory: rows.map((r) => ({
        playerName: r.playerName,
        sentence: r.sentence,
      })),
      startTime: gameConfig.startTime,
      endTime: gameConfig.endTime,
      maxWords: gameConfig.maxWords,
    });
  } catch (error) {
    console.error("[GET /api/game] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
