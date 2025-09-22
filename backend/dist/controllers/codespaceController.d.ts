import { Request, Response } from 'express';
export declare const getCurrentCodespace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCodespace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deactivateCodespace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const joinByCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=codespaceController.d.ts.map