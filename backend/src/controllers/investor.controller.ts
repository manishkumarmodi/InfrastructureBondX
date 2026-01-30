import { Request, Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { ProjectModel } from "../models/Project";
import { InvestmentModel } from "../models/Investment";
import { HttpError } from "../middleware/error-handler";

const investmentSchema = z.object({
  projectId: z.string().min(1),
  amount: z.number().positive(),
  tokens: z.number().positive(),
  paymentMethod: z.string().optional(),
});

export async function recordInvestment(req: Request, res: Response) {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const payload = investmentSchema.parse(req.body);
  const project = await ProjectModel.findById(payload.projectId);
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  const maturityDate = new Date();
  maturityDate.setFullYear(maturityDate.getFullYear() + project.tenure);
  const expectedPayout = payload.amount * (1 + project.roi / 100);
  const txHash = `0x${crypto.randomBytes(16).toString("hex")}`;

  const investment = await InvestmentModel.create({
    investor: req.auth.userId,
    project: project._id,
    tokens: payload.tokens,
    amount: payload.amount,
    txHash,
    expectedPayout,
    maturityDate,
    paymentMethod: payload.paymentMethod,
  });

  project.fundingRaised += payload.amount;
  await project.save();

  res.status(201).json(investment);
}

export async function getInvestorPortfolio(req: Request, res: Response) {
  const investorId = req.params.investorId;
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }
  if (!investorId) {
    throw new HttpError(400, "Missing investorId");
  }
  const isSelf = req.auth.userId === investorId;
  const isAdmin = req.auth.role === "admin";
  if (!isSelf && !isAdmin) {
    throw new HttpError(403, "Cannot view another investor portfolio");
  }

  const investments = await InvestmentModel.find({ investor: investorId })
    .populate("project", "name roi")
    .lean();
  const holdings = new Map<string, {
    projectId: string;
    projectName: string;
    tokens: number;
    invested: number;
    expectedPayout: number;
    maturityDate?: string;
    roi?: number;
  }>();

  investments.forEach((investment) => {
    const project = investment.project as unknown as { _id: string; name: string; roi: number };
    const key = project._id.toString();
    const current = holdings.get(key) ?? {
      projectId: key,
      projectName: project.name,
      tokens: 0,
      invested: 0,
      expectedPayout: 0,
      maturityDate: investment.maturityDate?.toISOString(),
      roi: project.roi,
    };

    current.tokens += investment.tokens;
    current.invested += investment.amount;
    current.expectedPayout += investment.expectedPayout ?? 0;
    current.maturityDate = investment.maturityDate?.toISOString();

    holdings.set(key, current);
  });

  res.json(Array.from(holdings.values()));
}

export async function getInvestorTransactions(req: Request, res: Response) {
  const investorId = req.params.investorId;
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }
  if (!investorId) {
    throw new HttpError(400, "Missing investorId");
  }
  const isSelf = req.auth.userId === investorId;
  const isAdmin = req.auth.role === "admin";
  if (!isSelf && !isAdmin) {
    throw new HttpError(403, "Cannot view another investor transactions");
  }

  const transactions = await InvestmentModel.find({ investor: investorId })
    .populate("project", "name tokenPrice")
    .sort({ createdAt: -1 })
    .lean();

  res.json(
    transactions.map((tx) => ({
      id: tx._id,
      timestamp: tx.createdAt,
      projectId: (tx.project as unknown as { _id: string })._id,
      projectName: (tx.project as unknown as { name: string }).name,
      type: "buy",
      tokens: tx.tokens,
      price: (tx.project as unknown as { tokenPrice: number }).tokenPrice,
      status: tx.status,
      txHash: tx.txHash,
    }))
  );
}
