import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunication extends Document {
  campaignId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  status: string;
  dispatchedAt?: Date;
  resolvedAt?: Date;
}

const CommunicationSchema: Schema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  status: { type: String, enum: ['Pending', 'Sent', 'Delivered', 'Failed', 'Opened', 'Read', 'Clicked', 'Converted'], default: 'Pending' },
  dispatchedAt: { type: Date },
  resolvedAt: { type: Date },
});

CommunicationSchema.index({ campaignId: 1, status: 1 });
CommunicationSchema.index({ customerId: 1 });

export default mongoose.model<ICommunication>('Communication', CommunicationSchema);
