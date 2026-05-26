import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordEntry extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  password: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordEntrySchema = new Schema<IPasswordEntry>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordEntry = mongoose.models.PasswordEntry || mongoose.model<IPasswordEntry>('PasswordEntry', PasswordEntrySchema);