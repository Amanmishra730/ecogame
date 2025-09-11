import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  approved?: boolean;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: IQuizQuestion[];
  totalPoints: number;
  timeLimit: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['environment', 'recycling', 'water', 'energy', 'biodiversity', 'climate']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  approved: {
    type: Boolean,
    default: false
  }
});

const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['environment', 'recycling', 'water', 'energy', 'biodiversity', 'climate']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  questions: [QuizQuestionSchema],
  totalPoints: {
    type: Number,
    required: true,
    min: 1
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
QuizSchema.index({ category: 1, difficulty: 1, isActive: 1 });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
