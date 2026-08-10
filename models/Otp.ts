import mongoose, { Schema, models, model } from "mongoose";

/**
 * One-time codes for guest checkout verification.
 *
 * Two channels. SMS is the better experience but needs DLT registration in
 * India, which takes days of operator approval. Email needs only SMTP
 * credentials, so it's the channel that lets a store open immediately. The
 * verification logic is identical either way — only the delivery differs.
 *
 * Design notes:
 *  - The code is stored as a SHA-256 hash, never in plaintext. A database dump
 *    or a stray log line then can't be replayed to place orders as someone else.
 *  - `expiresAt` carries a TTL index, so MongoDB deletes expired codes itself;
 *    there's no cleanup job to forget to run.
 *  - `attempts` is capped by the verify route, which turns brute-forcing a
 *    6-digit code from ~500k tries into 5.
 *  - `consumedAt` marks single use, so a code that's already been redeemed
 *    can't be replayed even inside its validity window.
 */
export type OtpChannel = "sms" | "email";

export interface IOtp {
  _id: string;
  /** Exactly one of phone/email is set, matching `channel`. */
  phone?: string;
  email?: string;
  channel: OtpChannel;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
  /** Coarse abuse signal — lets us rate-limit a single origin across numbers. */
  requestIp?: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone: { type: String, index: true },
    email: { type: String, index: true, lowercase: true, trim: true },
    channel: { type: String, enum: ["sms", "email"], required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
    requestIp: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// An OTP with neither identifier could never be verified against anything, so
// it's rejected at write time rather than becoming a dead row.
OtpSchema.pre("validate", function (next) {
  if (!this.phone && !this.email) {
    return next(new Error("An OTP requires either a phone or an email."));
  }
  next();
});

// MongoDB removes the document once expiresAt passes.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.Otp || model<IOtp>("Otp", OtpSchema);
