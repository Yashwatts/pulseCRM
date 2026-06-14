import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  segmentId: mongoose.Types.ObjectId;
  channel: string;
  subject?: string;
  messageTemplate: string;
  status: string;
  createdAt: Date;
}

const CampaignSchema: Schema = new Schema({
  name: { type: String, required: true },
  segmentId: { type: Schema.Types.ObjectId, ref: 'Segment', required: true },
  channel: { type: String, enum: ['Email', 'SMS', 'WhatsApp'], default: 'Email' },
  subject: { type: String },
  messageTemplate: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Running', 'Completed'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
});

CampaignSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
