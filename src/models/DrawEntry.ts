import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDrawEntry extends Document {
  drawId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  scores: number[];
  matchCount: number;
  isWinner: boolean;
  createdAt: Date;
}

const DrawEntrySchema = new Schema<IDrawEntry>(
  {
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scores: { type: [Number], required: true },
    matchCount: { type: Number, default: 0 },
    isWinner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DrawEntrySchema.index({ drawId: 1, userId: 1 }, { unique: true });
DrawEntrySchema.index({ userId: 1, createdAt: -1 });

export const DrawEntry: Model<IDrawEntry> =
  mongoose.models.DrawEntry || mongoose.model<IDrawEntry>('DrawEntry', DrawEntrySchema);
