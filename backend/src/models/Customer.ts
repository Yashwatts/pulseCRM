import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalSpent: number;
  lastOrderDate?: Date;
  city?: string;
  aiTags: string[];
}

const CustomerSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  totalSpent: { type: Number, default: 0, min: 0 },
  lastOrderDate: { type: Date },
  city: { type: String },
  aiTags: [{ type: String }],
});

CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ lastOrderDate: -1 });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
