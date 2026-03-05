import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import GameConfig, { IGameConfig } from "@/models/GameConfig";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ConfigBody {
  configId: string;
  startTime: Date;
  endTime: Date;
  maxWords: number;
  isActive: boolean;
}

// ──────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    // Get all configs or active config
    try {
      await connectToDatabase();

      const configs = await GameConfig.find({}).sort({ createdAt: -1 }).lean();

      if (req.query.active === "true") {
        const activeConfig = await GameConfig.findOne({ isActive: true }).lean();
        return res.status(200).json(activeConfig || null);
      }

      return res.status(200).json(configs);
    } catch (error) {
      console.error("[GET /api/config] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    // Create new config
    try {
      await connectToDatabase();

      const { configId, startTime, endTime, maxWords, isActive } = req.body as ConfigBody;

      if (!configId || !startTime || !endTime || maxWords === undefined || isActive === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // If setting this config as active, deactivate others
      if (isActive) {
        await GameConfig.updateMany({}, { isActive: false });
      }

      const config = await GameConfig.create({
        configId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        maxWords,
        isActive,
      });

      return res.status(201).json(config);
    } catch (error) {
      console.error("[POST /api/config] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    // Update config
    try {
      await connectToDatabase();

      const { configId } = req.query;
      const { startTime, endTime, maxWords, isActive } = req.body as Partial<ConfigBody>;

      if (!configId) {
        return res.status(400).json({ error: "configId is required" });
      }

      // If setting this config as active, deactivate others
      if (isActive) {
        await GameConfig.updateMany({ configId: { $ne: configId } }, { isActive: false });
      }

      const updateData: Partial<IGameConfig> = {};
      if (startTime) updateData.startTime = new Date(startTime);
      if (endTime) updateData.endTime = new Date(endTime);
      if (maxWords !== undefined) updateData.maxWords = maxWords;
      if (isActive !== undefined) updateData.isActive = isActive;

      const config = await GameConfig.findOneAndUpdate(
        { configId },
        updateData,
        { new: true }
      );

      if (!config) {
        return res.status(404).json({ error: "Config not found" });
      }

      return res.status(200).json(config);
    } catch (error) {
      console.error("[PUT /api/config] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}