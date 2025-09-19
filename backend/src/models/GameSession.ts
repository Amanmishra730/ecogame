import mongoose, { Document, Schema } from 'mongoose';

export interface IGameSession extends Document {
  userId: string;
  gameType: 'waste-sorting' | 'water-simulator' | 'energy-challenge' | 'ar-waste' | 'ar-tree';
  score: number;
  xpEarned: number;
  duration: number; // in seconds
  level: number;
  completed: boolean;
  achievements: string[];
  gameData: {
    itemsSorted?: number;
    waterSaved?: number;
    energyEfficient?: number;
    accuracy?: number;
    itemsRecognized?: number;
    treeId?: string;
    treeName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GameSessionSchema = new Schema<IGameSession>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  gameType: {
    type: String,
    required: true,
    enum: ['waste-sorting', 'water-simulator', 'energy-challenge', 'ar-waste', 'ar-tree']
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  xpEarned: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  achievements: [{
    type: String,
    enum: [
      'perfect_score',
      'speed_demon',
      'eco_master',
      'first_completion',
      'high_accuracy',
      'time_efficient'
    ]
  }],
  gameData: {
    itemsSorted: Number,
    waterSaved: Number,
    energyEfficient: Number,
    accuracy: Number,
    itemsRecognized: Number,
    treeId: String,
    treeName: String
  }
}, {
  timestamps: true
});

// Index for user game history
GameSessionSchema.index({ userId: 1, createdAt: -1 });
GameSessionSchema.index({ gameType: 1, score: -1 });

export default mongoose.model<IGameSession>('GameSession', GameSessionSchema);
