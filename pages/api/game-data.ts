import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import GameData, { IGameData } from "@/models/GameData";

type ResponseData = IGameData[] | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    const data = await GameData.find({}).sort({ timestamp: -1 }).lean();

    return res.status(200).json(data as IGameData[]);
  } catch (error) {
    console.error("[GET /api/game-data] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
