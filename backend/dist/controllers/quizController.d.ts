import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const getQuizzes: (req: Request, res: Response) => Promise<void>;
export declare const getQuizById: (req: Request, res: Response) => Promise<void>;
export declare const createQuiz: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateQuiz: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteQuiz: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getQuizzesByCreator: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const approveQuestion: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const exportQuizzesCsv: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const submitQuizAttempt: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserQuizHistory: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=quizController.d.ts.map