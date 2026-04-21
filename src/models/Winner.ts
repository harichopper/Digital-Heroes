import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWinner extends Document {
  drawId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  drawEntryId?: mongoose.Types.ObjectId;
  matchCount: number;
  prizeAmount: number;
  proofUrl?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'pending' | 'paid';
  adminNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WinnerSchema = new Schema<IWinner>(
  {
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    drawEntryId: { type: Schema.Types.ObjectId, ref: 'DrawEntry' },
    matchCount: { type: Number, required: true, enum: [3, 4, 5] },
    prizeAmount: { type: Number, default: 0 },
    proofUrl: { type: String },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    adminNotes: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

WinnerSchema.index({ drawId: 1, userId: 1 }, { unique: true });
WinnerSchema.index({ userId: 1, createdAt: -1 });

export const Winner: Model<IWinner> =
  mongoose.models.Winner || mongoose.model<IWinner>('Winner', WinnerSchema);
