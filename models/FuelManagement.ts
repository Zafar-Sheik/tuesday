import mongoose, { Schema, Document } from 'mongoose';

export interface IFuelManagement extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  vehicle: string;
  mileage: number;
  amountFilled: number;
  litresFilled: number;
  garage: string;
  kmDone: number;
  image?: string; // base64 string
  complete: boolean;
  technician: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FuelManagementSchema = new Schema<IFuelManagement>(
  {
    date: {
      type: Date,
      required: true,
    },
    vehicle: {
      type: String,
      required: true,
      trim: true,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
    },
    amountFilled: {
      type: Number,
      required: true,
      min: 0,
    },
    litresFilled: {
      type: Number,
      required: true,
      min: 0,
    },
    garage: {
      type: String,
      required: true,
      trim: true,
    },
    kmDone: {
      type: Number,
      required: true,
      min: 0,
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

export const FuelManagement = mongoose.models.FuelManagement || mongoose.model<IFuelManagement>('FuelManagement', FuelManagementSchema);
