import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshop extends Document {
  _id: mongoose.Types.ObjectId;
  client: string;
  itemBookedIn: string;
  specs: string;
  faultOfItem: string;
  workScope: string;
  image?: string; // base64 string
  complete: boolean;
  technician: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkshopSchema = new Schema<IWorkshop>(
  {
    client: {
      type: String,
      required: true,
      trim: true,
    },
    itemBookedIn: {
      type: String,
      required: true,
      trim: true,
    },
    specs: {
      type: String,
      required: true,
      trim: true,
    },
    faultOfItem: {
      type: String,
      required: true,
      trim: true,
    },
    workScope: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // base64 string
    },
    complete: {
      type: Boolean,
      default: false,
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Workshop = mongoose.models.Workshop || mongoose.model<IWorkshop>('Workshop', WorkshopSchema);
