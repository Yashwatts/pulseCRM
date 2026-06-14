import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  campaignId: mongoose.Types.ObjectId;
  totalSent: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  opened: number;
  clicked: number;
  converted: number;
  aiInsights: string;
}

const AnalyticsSchema: Schema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  totalSent: { type: Number, default: 0 },
  successfulDeliveries: { type: Number, default: 0 },
  failedDeliveries: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  converted: { type: Number, default: 0 },
  aiInsights: { type: String, default: '' },
});

AnalyticsSchema.index({ campaignId: 1 }, { unique: true });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
