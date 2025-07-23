import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'tenant' | 'owner' | 'admin';
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['tenant', 'owner', 'admin'], default: 'tenant', required: true },
    phone: { type: String, default: '', trim: true },
  },
  {
    timestamps: true,
  }
);

// Only define index if not already defined
// if (!UserSchema.indexes().some((index) => index.keys?.email)) {
//   UserSchema.index({ email: 1 }, { unique: true });
// }

// Export model safely to avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;