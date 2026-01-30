import { Request, Response } from "express";
import { HttpError } from "../middleware/error-handler";
import { UserModel } from "../models/User";
import { ProjectSubmissionModel } from "../models/Submission";
import { ProjectModel } from "../models/Project";
import { InvestmentModel } from "../models/Investment";

export async function getAdminSummary(_req: Request, res: Response) {
  const [projects, submissions, verifiedIssuers, investors] = await Promise.all([
    ProjectModel.find().lean(),
    ProjectSubmissionModel.countDocuments({ status: "pending" }),
    UserModel.countDocuments({ role: "issuer", kycStatus: "verified" }),
    InvestmentModel.distinct("investor"),
  ]);

  const totalFundingRaised = projects.reduce((sum, project) => sum + (project.fundingRaised ?? 0), 0);

  res.json({
    activeProjects: projects.filter((project) => project.status === "active").length,
    totalFundingRaised,
    pendingApprovals: submissions,
    verifiedIssuers,
    totalInvestors: investors.length,
  });
}

export async function listSubmissions(_req: Request, res: Response) {
  const submissions = await ProjectSubmissionModel.find().sort({ submittedAt: -1 }).lean();
  res.json(submissions);
}

export async function approveSubmission(req: Request, res: Response) {
  const submission = await ProjectSubmissionModel.findById(req.params.submissionId);
  if (!submission) {
    throw new HttpError(404, "Submission not found");
  }
  if (submission.status !== "pending") {
    throw new HttpError(400, "Submission already processed");
  }

  const project = await ProjectModel.create({
    name: submission.name,
    category: submission.category,
    location: submission.location,
    description: submission.description,
    fundingTarget: submission.fundingTarget,
    fundingRaised: 0,
    roi: submission.roi,
    tenure: submission.tenure,
    tokenPrice: submission.tokenPrice,
    riskScore: 30,
    issuer: submission.issuer,
    issuerName: submission.issuerName,
    issuerVerified: true,
    status: "active",
    milestones: submission.milestones.map((milestone, index) => ({
      id: milestone.id ?? `ms-${index + 1}-${Date.now().toString(36)}`,
      name: milestone.name,
      status: milestone.status ?? "pending",
      date: milestone.date,
      escrowRelease: milestone.escrowRelease,
      proofStatus: milestone.proofStatus ?? "not-submitted",
      proofUploads: milestone.proofUploads ?? [],
      lastProofAt: milestone.lastProofAt,
      proofNotes: milestone.proofNotes,
    })),
  });

  submission.status = "approved";
  submission.approvedAt = new Date();
  await submission.save();

  res.json({ submission, project });
}

export async function rejectSubmission(req: Request, res: Response) {
  const submission = await ProjectSubmissionModel.findById(req.params.submissionId);
  if (!submission) {
    throw new HttpError(404, "Submission not found");
  }
  if (submission.status !== "pending") {
    throw new HttpError(400, "Submission already processed");
  }

  submission.status = "rejected";
  submission.rejectionReason = req.body.reason ?? "Rejected by admin";
  await submission.save();

  res.json(submission);
}
