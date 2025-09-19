import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    xp: number;
    level: number;
    badges: string[];
    completedQuizzes: number;
    gamesPlayed: number;
    streak: number;
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map