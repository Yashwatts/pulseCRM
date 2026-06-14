import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: { type: Schema.Types.ObjectId },
  timestamp: { type: Date, default: Date.now },
});

ActivityLogSchema.index({ timestamp: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
