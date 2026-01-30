import { Request, Response } from "express";
import { z } from "zod";
import { ProjectModel } from "../models/Project";
import { InvestmentModel } from "../models/Investment";
import { ProjectSubmissionModel } from "../models/Submission";
import { UserModel } from "../models/User";
import { HttpError } from "../middleware/error-handler";

const submissionSchema = z.object({
  name: z.string().min(3),
  category: z.string().min(3),
  location: z.string().min(3),
  description: z.string().min(20),
  fundingTarget: z.number().positive(),
  roi: z.number().min(0),
  tenure: z.number().positive(),
  tokenPrice: z.number().positive(),
  milestones: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(2),
        status: z.enum(["pending", "in-progress", "completed"]).optional(),
        date: z.string().optional(),
        escrowRelease: z.number().min(0).max(100).optional(),
        proofStatus: z.enum(["not-submitted", "submitted", "approved", "rejected"]).optional(),
        proofUploads: z
          .array(
            z.object({
              id: z.string().optional(),
              label: z.string(),
              fileName: z.string(),
              sizeBytes: z.number().optional(),
              previewUrl: z.string().optional(),
              uploadedAt: z.string().optional(),
            })
          )
          .optional(),
        lastProofAt: z.string().optional(),
        proofNotes: z.string().optional(),
      })
    )
    .default([]),
  documents: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string(),
        uploaded: z.boolean().optional(),
        fileName: z.string().optional(),
        sizeBytes: z.number().optional(),
        previewUrl: z.string().optional(),
      })
    )
    .default([]),
});

export async function getIssuerSummary(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const issuerId = req.params.issuerId ?? req.auth.userId;
  if (!issuerId) {
    throw new HttpError(400, "Missing issuerId");
  }

  const isOwner = req.auth.userId === issuerId;
  const isAdmin = req.auth.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "Cannot access another issuer summary");
  }

  const projects = await ProjectModel.find({ issuer: issuerId }).lean();
  const issuerProjectIds = projects.map((project) => project._id);
  const investments = await InvestmentModel.find({ project: { $in: issuerProjectIds } }).lean();

  const totalFundsRaised = projects.reduce((sum, project) => sum + (project.fundingRaised ?? 0), 0);
  const totalInvestors = new Set(investments.map((investment) => investment.investor.toString())).size;
  const averageProgress = projects.length
    ? projects.reduce((sum, project) => sum + (project.fundingRaised / project.fundingTarget) * 100, 0) / projects.length
    : 0;

  res.json({
    issuerId,
    organizationName: projects[0]?.issuerName,
    totalFundsRaised,
    totalInvestors,
    activeProjects: projects.filter((project) => project.status === "active").length,
    averageProgress: Number(averageProgress.toFixed(2)),
  });
}

export async function listIssuerProjects(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const issuerId = req.params.issuerId ?? req.auth.userId;
  if (!issuerId) {
    throw new HttpError(400, "Missing issuerId");
  }

  const isOwner = req.auth.userId === issuerId;
  const isAdmin = req.auth.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "Cannot access another issuer projects");
  }

  const projects = await ProjectModel.find({ issuer: issuerId }).lean();
  res.json(projects);
}

export async function submitProjectForReview(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const payload = submissionSchema.parse(req.body);
  const issuer = await UserModel.findById(req.auth.userId).lean();
  const issuerName = issuer?.organizationName ?? issuer?.name ?? req.auth.userId;
  const submission = await ProjectSubmissionModel.create({
    ...payload,
    issuer: req.auth.userId,
    issuerName,
  });

  res.status(201).json(submission);
}

export async function listIssuerSubmissions(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const submissions = await ProjectSubmissionModel.find({ issuer: req.auth.userId }).sort({ submittedAt: -1 }).lean();
  res.json(submissions);
}
