import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'user' | 'admin';
  selectedCharityId?: mongoose.Types.ObjectId;
  charityPercentage: number;
  stripeCustomerId?: string;
  countryCode: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, default: '' },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    selectedCharityId: { type: Schema.Types.ObjectId, ref: 'Charity' },
    charityPercentage: { type: Number, default: 10, min: 10, max: 100 },
    stripeCustomerId: { type: String },
    countryCode: { type: String, default: 'GB' },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password to hashed
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Prevent re-registering model during hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
