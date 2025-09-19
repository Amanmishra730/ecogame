import mongoose, { Document } from 'mongoose';
export interface IQuizAnswer {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
}
export interface IQuizAttempt extends Document {
    userId: string;
    quizId: mongoose.Types.ObjectId;
    answers: IQuizAnswer[];
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    completed: boolean;
    xpEarned: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IQuizAttempt, {}, {}, {}, mongoose.Document<unknown, {}, IQuizAttempt, {}, {}> & IQuizAttempt & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=QuizAttempt.d.ts.map