import { Request, Response } from "express";
import { z } from "zod";
import { ProjectModel } from "../models/Project";
import { UserModel } from "../models/User";
import { HttpError } from "../middleware/error-handler";

const milestoneProofInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  fileName: z.string().min(1),
  sizeBytes: z.number().nonnegative().optional(),
  uploadedAt: z.string().optional(),
  previewUrl: z.string().optional(),
});

const milestoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  status: z.enum(["pending", "in-progress", "completed"]).optional(),
  date: z.string().optional(),
  escrowRelease: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  proofStatus: z.enum(["not-submitted", "submitted", "approved", "rejected"]).optional(),
  proofUploads: z.array(milestoneProofInputSchema).optional(),
  lastProofAt: z.string().optional(),
  proofNotes: z.string().optional(),
});

const projectInputSchema = z.object({
  name: z.string().min(3),
  location: z.string().min(3),
  category: z.string().min(3),
  description: z.string().min(10),
  fundingTarget: z.number().positive(),
  fundingRaised: z.number().nonnegative().optional(),
  roi: z.number().min(0),
  tenure: z.number().positive(),
  tokenPrice: z.number().positive(),
  riskScore: z.number().min(0).max(100),
  status: z.enum(["active", "completed", "pending"]).optional(),
  issuerVerified: z.boolean().optional(),
  image: z.string().url().optional(),
  milestones: z.array(milestoneSchema).optional(),
});

const proofUploadSchema = z.object({
  label: z.string().min(1),
  fileName: z.string().min(1),
  sizeBytes: z.number().nonnegative().optional(),
  previewUrl: z.string().optional(),
});

const submitProofSchema = z.object({
  files: z.array(proofUploadSchema).min(1),
  notes: z.string().optional(),
});

const reviewProofSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().optional(),
});

export async function listProjects(req: Request, res: Response) {
  const filter: Record<string, unknown> = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.issuerId) {
    filter.issuer = req.query.issuerId;
  }

  const projects = await ProjectModel.find(filter).sort({ createdAt: -1 }).lean();
  res.json(projects);
}

export async function getProject(req: Request, res: Response) {
  const project = await ProjectModel.findById(req.params.projectId).lean();
  if (!project) {
    throw new HttpError(404, "Project not found");
  }
  res.json(project);
}

export async function createProject(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const payload = projectInputSchema.parse(req.body);
  const issuer = await UserModel.findById(req.auth.userId);
  if (!issuer) {
    throw new HttpError(403, "Issuer profile not found");
  }

  const project = await ProjectModel.create({
    ...payload,
    issuer: issuer._id,
    issuerName: issuer.organizationName ?? issuer.name,
    fundingRaised: payload.fundingRaised ?? 0,
    issuerVerified: payload.issuerVerified ?? issuer.kycStatus === "verified",
  });

  res.status(201).json(project);
}

export async function updateProject(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const payload = projectInputSchema.partial().parse(req.body);
  const project = await ProjectModel.findById(req.params.projectId);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  const isOwner = project.issuer.toString() === req.auth.userId;
  const isAdmin = req.auth.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "Only the owning issuer or an admin can update this project");
  }

  Object.assign(project, payload);
  await project.save();

  res.json(project);
}

export async function addMilestone(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const project = await ProjectModel.findById(req.params.projectId);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  const isOwner = project.issuer.toString() === req.auth.userId;
  const isAdmin = req.auth.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "Unauthorized to add milestones");
  }

  const milestone = milestoneSchema.parse(req.body);
  const normalizedMilestone = {
    id: milestone.id ?? `ms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: milestone.name,
    status: milestone.status ?? "pending",
    date: milestone.date,
    escrowRelease: milestone.escrowRelease,
    notes: milestone.notes,
    proofStatus: milestone.proofStatus ?? "not-submitted",
    proofUploads: milestone.proofUploads ?? [],
    lastProofAt: milestone.lastProofAt,
    proofNotes: milestone.proofNotes,
  };

  project.milestones.push(normalizedMilestone);
  await project.save();

  const lastMilestone = project.milestones[project.milestones.length - 1];
  res.status(201).json(lastMilestone);
}

export async function updateMilestone(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const project = await ProjectModel.findById(req.params.projectId);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) {
    throw new HttpError(404, "Milestone not found");
  }

  const isOwner = project.issuer.toString() === req.auth.userId;
  const isAdmin = req.auth.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "Unauthorized to update milestones");
  }

  const payload = milestoneSchema.partial().parse(req.body);
  Object.assign(milestone, {
    ...payload,
  });

  await project.save();
  res.json(milestone);
}

export async function submitMilestoneProofController(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const project = await ProjectModel.findById(req.params.projectId);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  if (project.issuer.toString() !== req.auth.userId && req.auth.role !== "admin") {
    throw new HttpError(403, "Unauthorized to submit proofs for this project");
  }

  const milestone = project.milestones.find((entry) => entry.id === req.params.milestoneId);
  if (!milestone) {
    throw new HttpError(404, "Milestone not found");
  }

  const payload = submitProofSchema.parse(req.body);
  const submissionTimestamp = new Date().toISOString();

  const preparedProofs = payload.files.map((file) => ({
    id: file.label.concat("-", Date.now().toString(36)),
    label: file.label,
    fileName: file.fileName,
    sizeBytes: file.sizeBytes,
    uploadedAt: submissionTimestamp,
    previewUrl: file.previewUrl,
  }));

  milestone.status = "in-progress";
  milestone.proofStatus = "submitted";
  milestone.lastProofAt = submissionTimestamp;
  milestone.proofNotes = payload.notes ?? milestone.proofNotes;
  preparedProofs.forEach((proof) => milestone.proofUploads.push(proof as any));

  project.markModified("milestones");
  await project.save();

  res.status(201).json(milestone);
}

export async function reviewMilestoneProofController(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "admin") {
    throw new HttpError(403, "Admin access required");
  }

  const project = await ProjectModel.findById(req.params.projectId);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  const milestone = project.milestones.find((entry) => entry.id === req.params.milestoneId);
  if (!milestone) {
    throw new HttpError(404, "Milestone not found");
  }

  const payload = reviewProofSchema.parse(req.body);
  milestone.proofStatus = payload.decision === "approved" ? "approved" : "rejected";
  milestone.status = payload.decision === "approved" ? "completed" : "in-progress";
  milestone.proofNotes = payload.notes ?? milestone.proofNotes;
  milestone.lastProofAt = new Date().toISOString();

  project.markModified("milestones");
  await project.save();

  res.json(milestone);
}
