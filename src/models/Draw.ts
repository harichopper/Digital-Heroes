import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDraw extends Document {
  drawDate: string;
  month: number;
  year: number;
  drawType: 'random' | 'algorithmic';
  winningNumbers: number[];
  status: 'pending' | 'simulated' | 'published';
  totalPool: number;
  jackpotPool: number;
  fourMatchPool: number;
  threeMatchPool: number;
  jackpotRollover: number;
  totalParticipants: number;
  simulationData?: object;
  publishedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DrawSchema = new Schema<IDraw>(
  {
    drawDate: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    drawType: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
    winningNumbers: { type: [Number], default: [] },
    status: { type: String, enum: ['pending', 'simulated', 'published'], default: 'pending' },
    totalPool: { type: Number, default: 0 },
    jackpotPool: { type: Number, default: 0 },
    fourMatchPool: { type: Number, default: 0 },
    threeMatchPool: { type: Number, default: 0 },
    jackpotRollover: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },
    simulationData: { type: Schema.Types.Mixed },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// One draw per month+year
DrawSchema.index({ month: 1, year: 1 }, { unique: true });

export const Draw: Model<IDraw> =
  mongoose.models.Draw || mongoose.model<IDraw>('Draw', DrawSchema);
