import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICharityEvent {
  title: string;
  date: string;
  description: string;
  location?: string;
}

export interface ICharity extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  websiteUrl?: string;
  category?: string;
  isFeatured: boolean;
  isActive: boolean;
  totalReceived: number; // in pence
  upcomingEvents: ICharityEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const CharitySchema = new Schema<ICharity>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    shortDescription: { type: String },
    logoUrl: { type: String },
    coverImageUrl: { type: String },
    websiteUrl: { type: String },
    category: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalReceived: { type: Number, default: 0 },
    upcomingEvents: [
      {
        title: String,
        date: String,
        description: String,
        location: String,
      },
    ],
  },
  { timestamps: true }
);

CharitySchema.index({ isActive: 1, isFeatured: -1 });

export const Charity: Model<ICharity> =
  mongoose.models.Charity || mongoose.model<ICharity>('Charity', CharitySchema);
