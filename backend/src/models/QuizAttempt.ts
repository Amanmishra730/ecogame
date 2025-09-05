import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface IQuizAttempt extends Document {
  userId: string;
  quizId: string;
  answers: IQuizAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  completed: boolean;
  xpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAnswerSchema = new Schema<IQuizAnswer>({
  questionId: {
    type: String,
    required: true
  },
  selectedAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  }
});

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  quizId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Quiz'
  },
  answers: [QuizAnswerSchema],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  xpEarned: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for user quiz history
QuizAttemptSchema.index({ userId: 1, createdAt: -1 });
QuizAttemptSchema.index({ quizId: 1, score: -1 });

export default mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
