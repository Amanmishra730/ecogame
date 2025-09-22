import mongoose, { Document, Schema } from 'mongoose';

export interface ICodespace extends Document {
  code: string; // short unique code students enter
  adminUserId: string; // Firebase UID of the admin
  quizId?: string; // optional: target quiz id
  active: boolean;
  expiresAt: Date; // expiry time
  createdAt: Date;
  updatedAt: Date;
}

const CodespaceSchema = new Schema<ICodespace>({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  adminUserId: {
    type: String,
    required: true,
    index: true,
  },
  quizId: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '0s' }, // TTL handled by MongoDB when expiresAt < now
  },
}, {
  timestamps: true,
});

export default mongoose.model<ICodespace>('Codespace', CodespaceSchema);
