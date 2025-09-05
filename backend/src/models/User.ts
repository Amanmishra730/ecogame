import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  xp: number;
  level: number;
  badges: string[];
  completedQuizzes: number;
  gamesPlayed: number;
  streak: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  badges: [{
    type: String,
    enum: [
      'first_quiz',
      'quiz_master',
      'eco_warrior',
      'water_saver',
      'waste_sorter',
      'streak_7',
      'streak_30',
      'level_10',
      'level_25',
      'level_50'
    ]
  }],
  completedQuizzes: {
    type: Number,
    default: 0,
    min: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
UserSchema.index({ xp: -1, level: -1 });

export default mongoose.model<IUser>('User', UserSchema);
