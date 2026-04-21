import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  playedDate: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 1, max: 45 },
    playedDate: { type: String, required: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

// One score per user per date
ScoreSchema.index({ userId: 1, playedDate: 1 }, { unique: true });
ScoreSchema.index({ userId: 1, createdAt: -1 });

export const Score: Model<IScore> =
  mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);
