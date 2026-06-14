import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  productName: string;
  amount: number;
  status: string;
  orderDate: Date;
}

const OrderSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  productName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Cancelled'], default: 'Completed' },
  orderDate: { type: Date, default: Date.now },
});

OrderSchema.index({ customerId: 1, orderDate: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
