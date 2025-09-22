import mongoose, { Document } from 'mongoose';
export interface ICodespace extends Document {
    code: string;
    adminUserId: string;
    quizId?: string;
    active: boolean;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICodespace, {}, {}, {}, mongoose.Document<unknown, {}, ICodespace, {}, {}> & ICodespace & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Codespace.d.ts.map