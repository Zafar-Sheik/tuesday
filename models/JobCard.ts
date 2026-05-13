import mongoose, { Schema, Document } from 'mongoose';

export interface IJobCard extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  clientCompany: string;
  clientName: string;
  faultDescription: string;
  scopeOfWork: string;
  workCarriedOut: string;
  timeIn: string;
  timeOut: string;
  comments?: string;
  image?: string;
  clientSignature?: string;
  signedAt?: Date;
  complete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobCardSchema = new Schema<IJobCard>(
  {
    date: {
      type: Date,
      required: true,
    },
    clientCompany: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    faultDescription: {
      type: String,
      required: true,
      trim: true,
    },
    scopeOfWork: {
      type: String,
      required: true,
      trim: true,
    },
    workCarriedOut: {
      type: String,
      required: true,
      trim: true,
    },
    timeIn: {
      type: String,
      required: true,
      // Format: HH:mm
    },
    timeOut: {
      type: String,
      required: true,
      // Format: HH:mm
    },
    comments: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // base64 string
    },
    clientSignature: {
      type: String,
    },
    signedAt: {
      type: Date,
    },
    complete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const JobCard = mongoose.models.JobCard || mongoose.model<IJobCard>('JobCard', JobCardSchema);
