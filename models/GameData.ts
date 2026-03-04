import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGameData extends Document {
  playerName: string;
  sentence: string;
  timestamp: Date;
}

const GameDataSchema = new Schema<IGameData>(
  {
    playerName: { type: String, required: true },
    sentence: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "game-data" },
);

const GameData: Model<IGameData> =
  mongoose.models.GameData ||
  mongoose.model<IGameData>("GameData", GameDataSchema);

export default GameData;
