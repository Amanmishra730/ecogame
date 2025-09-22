import mongoose, { Document } from 'mongoose';
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
    timeLimit: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, {}> & IQuiz & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Quiz.d.ts.map