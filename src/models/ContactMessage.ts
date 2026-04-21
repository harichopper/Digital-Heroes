import { Schema, models, model } from 'mongoose';

export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    topic:   { type: String, default: 'General Enquiry' },
    message: { type: String, required: true, trim: true },
    status:  { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

export const ContactMessage =
  models.ContactMessage ||
  model<IContactMessage>('ContactMessage', contactMessageSchema);
