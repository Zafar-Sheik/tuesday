import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryItem {
  item: string;
  quantity: number;
}

export interface IDelivery extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  client: string;
  location: string;
  technician: mongoose.Types.ObjectId;
  items: IDeliveryItem[];
  receivedBy: string;
  clientSignature?: string;
  signedAt?: Date;
  image?: string;
  complete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryItemSchema = new Schema<IDeliveryItem>({
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

const DeliverySchema = new Schema<IDelivery>(
  {
    date: {
      type: Date,
      required: true,
    },
    client: {
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
    items: {
      type: [DeliveryItemSchema],
      required: true,
    },
    receivedBy: {
      type: String,
      required: true,
      trim: true,
    },
    clientSignature: {
      type: String,
    },
    signedAt: {
      type: Date,
    },
    image: {
      type: String,
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

export const Delivery = mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);
