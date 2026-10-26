import mongoose, { Document, Schema } from 'mongoose';
import { AppRole } from '../types';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: AppRole;
  assignedBusId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Document, IUser {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['student', 'driver', 'admin'] },
    assignedBusId: { type: String, trim: true }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
