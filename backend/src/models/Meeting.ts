import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description: string;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: { type: String, required: true },
  participants: [{ type: String, required: true }]
}, {
  timestamps: true
});

export default mongoose.model<IMeeting>('Meeting', MeetingSchema); 