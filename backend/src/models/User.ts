import { Schema, model, type InferSchemaType } from "mongoose";
import type { UserRole } from "../middleware/auth";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["investor", "issuer", "admin"] satisfies UserRole[] },
    organizationName: { type: String, trim: true },
    kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    kycCompletedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };

export const UserModel = model("User", userSchema);
