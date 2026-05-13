import mongoose, { Schema, Document } from 'mongoose';

export interface ICollectionItem {
  item: string;
  quantity: number;
}

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  supplier: string;
  location: string;
  technician: mongoose.Types.ObjectId;
  vehicle: string;
  items: ICollectionItem[];
  client: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionItemSchema = new Schema<ICollectionItem>({
  item: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const CollectionSchema = new Schema<ICollection>(
  {
    date: {
      type: Date,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [CollectionItemSchema],
      required: true,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Collection = mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);
