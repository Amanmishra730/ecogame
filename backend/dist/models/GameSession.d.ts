import mongoose, { Document } from 'mongoose';
export interface IGameSession extends Document {
    userId: string;
    gameType: 'waste-sorting' | 'water-simulator' | 'energy-challenge' | 'ar-waste' | 'ar-tree';
    score: number;
    xpEarned: number;
    duration: number;
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
declare const _default: mongoose.Model<IGameSession, {}, {}, {}, mongoose.Document<unknown, {}, IGameSession, {}, {}> & IGameSession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=GameSession.d.ts.map