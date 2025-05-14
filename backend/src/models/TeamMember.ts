import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailability {
  date: string;
  timeSlots: boolean[];
}

export interface ITeamMember extends Document {
  name: string;
  availability: {
    [key: string]: boolean[];  // Each array has 25 slots (8:00-20:00, 30min intervals)
  };
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  availability: {
    type: Map,
    of: [Boolean],
    default: new Map(),
    validate: {
      validator: function(v: Map<string, boolean[]>) {
        // Validate that each array has the correct length (25 slots)
        return Array.from(v.values()).every(arr => !arr || arr.length === 25);
      },
      message: 'Each availability array must have 25 time slots'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema); 