import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const submitGameSession: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserGameHistory: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getGameLeaderboard: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=gameController.d.ts.map