import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGameConfig extends Document {
  configId: string;
  startTime: Date;
  endTime: Date;
  maxWords: number;
  isActive: boolean;
}

const GameConfigSchema = new Schema<IGameConfig>(
  {
    configId: { type: String, required: true, unique: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    maxWords: { type: Number, required: true },
    isActive: { type: Boolean, required: true },
  },
  { collection: "game-config" },
);

const GameConfig: Model<IGameConfig> =
  mongoose.models.GameConfig ||
  mongoose.model<IGameConfig>("GameConfig", GameConfigSchema);

export default GameConfig;