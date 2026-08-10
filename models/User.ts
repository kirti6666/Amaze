import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string; // absent for OAuth-only users
  provider: 'credentials' | 'google';
  role: 'customer' | 'admin';
  avatar?: string;
  phone?: string;
  addresses: mongoose.Types.ObjectId[];
  wishlist: mongoose.Types.ObjectId[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false }, // never returned by default queries
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: { type: String },
    phone: { type: String },
    addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// NOTE: no explicit index here — `unique: true` on the field already
// creates it. Declaring both makes Mongoose log a duplicate-index warning.

export default models.User || model<IUser>('User', UserSchema);
