import mongoose, { Schema, Document } from 'mongoose';

export interface ISegment extends Document {
  name: string;
  description: string;
  rules: any[]; // The structured UI rules
  aiInterpretation?: string;
  recommendations?: any;
  createdAt: Date;
}

const SegmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  rules: { type: [Schema.Types.Mixed], required: true },
  aiInterpretation: { type: String },
  recommendations: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

SegmentSchema.index({ name: 1 });

export default mongoose.model<ISegment>('Segment', SegmentSchema);
