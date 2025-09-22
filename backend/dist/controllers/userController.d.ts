import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const getUserProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createOrUpdateUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateUserStats: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getLeaderboard: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map