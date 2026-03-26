import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectType extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  allowedRoles: ('admin' | 'developer' | 'technician')[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectTypeSchema = new Schema<IProjectType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    allowedRoles: {
      type: [String],
      enum: ['admin', 'developer', 'technician'],
      required: true,
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

export const ProjectType = mongoose.models.ProjectType || mongoose.model<IProjectType>('ProjectType', ProjectTypeSchema);
