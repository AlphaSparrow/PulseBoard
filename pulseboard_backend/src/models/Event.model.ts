import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  imageUrl?: string;
  clubId: number;      // The link to the Club ID (e.g., 11, 15)
  title: string;
  description?: string;
  icon: string;        
  badge: 'LIVE' | 'UPCOMING';
  date: Date;          
  timeDisplay: string; 
  location: string;
  color?: string;      
}

const EventSchema: Schema = new Schema({
  imageUrl: { type: String },
  clubId: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '📅' },
  badge: { 
    type: String, 
    enum: ['LIVE', 'UPCOMING'], 
    default: 'UPCOMING' 
  },
  date: { type: Date, required: true },
  timeDisplay: { type: String, required: true },
  location: { type: String, required: true },
  color: { type: String, default: '#ffffff' },
}, {
  timestamps: true 
});

export default mongoose.model<IEvent>('Event', EventSchema);