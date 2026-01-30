import { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../models/User";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAuthToken } from "../utils/token";
import { HttpError } from "../middleware/error-handler";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6),
  role: z.enum(["investor", "issuer", "admin"]),
  organizationName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6),
});

export async function registerUser(req: Request, res: Response) {
  const payload = registerSchema.parse(req.body);

  const existing = await UserModel.findOne({ email: payload.email });
  if (existing) {
    throw new HttpError(409, "User already exists");
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    passwordHash,
    role: payload.role,
    organizationName: payload.organizationName,
    kycStatus: payload.role === "investor" ? "pending" : "verified",
  });

  const token = signAuthToken({ userId: user.id, role: user.role });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationName: user.organizationName,
      kycStatus: user.kycStatus,
    },
  });
}

export async function loginUser(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);

  const user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await verifyPassword(payload.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signAuthToken({ userId: user.id, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationName: user.organizationName,
      kycStatus: user.kycStatus,
    },
  });
}

export async function getProfile(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await UserModel.findById(req.auth.userId).lean();
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationName: user.organizationName,
    kycStatus: user.kycStatus,
  });
}

export async function completeKyc(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await UserModel.findById(req.auth.userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  user.kycStatus = "verified";
  user.kycCompletedAt = new Date();
  await user.save();

  res.json({
    id: user._id,
    kycStatus: user.kycStatus,
    kycCompletedAt: user.kycCompletedAt,
  });
}
