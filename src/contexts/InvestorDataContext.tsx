import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Project } from "@/types/project";
import type { Milestone, MilestoneProof } from "@/app/components/MilestoneStepper";

export interface InvestorMetrics {
  totalInvested?: number;
  tokensOwned?: number;
  expectedReturns?: number;
  averageRoi?: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface RiskSlice {
  label: string;
  value: number;
  color?: string;
}

export interface InvestorNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  variant?: "success" | "info" | "warning";
}

export interface InvestorRecommendation {
  projectId: string;
  roi?: number;
  riskScore?: number;
  progress?: number;
  summary?: string;
}

export interface PortfolioHolding {
  projectId: string;
  tokens: number;
  invested: number;
  currentValue?: number;
  expectedPayout?: number;
  maturityDate?: string;
}

export interface InvestorTransaction {
  id: string;
  timestamp: string;
  projectId: string;
  projectName: string;
  type: "buy" | "sell";
  tokens: number;
  price: number;
  status: "completed" | "pending";
  txHash: string;
}

export interface InvestmentCertificate {
  id: string;
  projectId: string;
  projectName: string;
  issuerId: string;
  issuerName: string;
  investorId: string;
  investorName: string;
  tokens: number;
  amount: number;
  issuedAt: string;
  txHash: string;
  fileName: string;
  downloadUrl?: string;
}

export interface IssuerSummaryMetrics {
  organizationName?: string;
  totalFundsRaised?: number;
  totalInvestors?: number;
  activeProjects?: number;
  averageProgress?: number;
}

export interface IssuerMilestoneOverview {
  id: string;
  projectId: string;
  projectName: string;
  milestoneName: string;
  dueDate?: string;
  status?: "pending" | "in-progress" | "completed";
}

export interface IssuerActivityLog {
  id: string;
  message: string;
  timestamp: string;
  category?: string;
}

export interface IssuerProjectPerformance {
  projectId: string;
  projectName: string;
  fundingTarget?: number;
  fundingRaised?: number;
  progressPercent?: number;
  investors?: number;
}

export interface AdminSummaryMetrics {
  activeProjects?: number;
  verifiedIssuers?: number;
  pendingApprovals?: number;
  fraudAlerts?: number;
  totalFundingRaised?: number;
  totalInvestors?: number;
  milestoneSuccessRate?: number;
  escrowReleased?: number;
}

export interface AdminMetricPoint {
  month: string;
  funding?: number;
  projects?: number;
}

export interface AdminApprovalItem {
  id: string;
  type: string;
  entity: string;
  submitted: string;
  priority?: "low" | "medium" | "high";
}

export interface AdminAlertItem {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
  time: string;
}

export interface SubmissionDocument {
  id: string;
  label: string;
  uploaded: boolean;
  fileName?: string;
  previewUrl?: string;
  sizeBytes?: number;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface ProjectSubmission {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  fundingTarget: number;
  roi: number;
  tenure: number;
  tokenPrice: number;
  milestones: Milestone[];
  documents: SubmissionDocument[];
  issuerId: string;
  issuerName: string;
  status: SubmissionStatus;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ProjectSubmissionInput {
  name: string;
  category: string;
  location: string;
  description: string;
  fundingTarget: number;
  roi: number;
  tenure: number;
  tokenPrice: number;
  milestones: Milestone[];
  documents: SubmissionDocument[];
  issuerId: string;
  issuerName: string;
}

export interface PlatformData {
  metrics?: InvestorMetrics;
  portfolioTrend?: TrendPoint[];
  riskBreakdown?: RiskSlice[];
  notifications?: InvestorNotification[];
  recommendations?: InvestorRecommendation[];
  projects?: Project[];
  holdings?: PortfolioHolding[];
  transactions?: InvestorTransaction[];
  issuerSummary?: IssuerSummaryMetrics;
  issuerFundingTrend?: TrendPoint[];
  issuerInvestorMix?: RiskSlice[];
  issuerUpcomingMilestones?: IssuerMilestoneOverview[];
  issuerRecentActivity?: IssuerActivityLog[];
  issuerProjectPerformance?: IssuerProjectPerformance[];
  adminSummary?: AdminSummaryMetrics;
  adminMetrics?: AdminMetricPoint[];
  adminPendingApprovals?: AdminApprovalItem[];
  adminAlerts?: AdminAlertItem[];
  projectSubmissions?: ProjectSubmission[];
  projectInvestors?: Record<string, string[]>;
  investmentCertificates?: InvestmentCertificate[];
}

interface InvestorDataContextValue {
  data: PlatformData;
  updateData: (partial: Partial<PlatformData>) => void;
  resetData: () => void;
  recordInvestment: (payload: RecordInvestmentPayload) => InvestmentCertificate | null;
  submitProject: (input: ProjectSubmissionInput) => ProjectSubmission;
  approveProject: (submissionId: string) => void;
  rejectProject: (submissionId: string, reason?: string) => void;
  submitMilestoneProof: (payload: SubmitMilestoneProofPayload) => void;
  reviewMilestoneProof: (payload: ReviewMilestoneProofPayload) => void;
}

export interface RecordInvestmentPayload {
  project: Project;
  amount: number;
  tokens: number;
  txHash?: string;
  investorId: string;
  investorName?: string;
}

interface MilestoneProofInput {
  label: string;
  file: File;
}

interface SubmitMilestoneProofPayload {
  projectId: string;
  milestoneId: string;
  files: MilestoneProofInput[];
  notes?: string;
}

interface ReviewMilestoneProofPayload {
  projectId: string;
  milestoneId: string;
  decision: "approved" | "rejected";
  notes?: string;
}

const createInitialState = (): PlatformData => ({
  metrics: undefined,
  portfolioTrend: [],
  riskBreakdown: [],
  notifications: [],
  recommendations: [],
  projects: [],
  holdings: [],
  transactions: [],
  issuerSummary: undefined,
  issuerFundingTrend: [],
  issuerInvestorMix: [],
  issuerUpcomingMilestones: [],
  issuerRecentActivity: [],
  issuerProjectPerformance: [],
  adminSummary: undefined,
  adminMetrics: [],
  adminPendingApprovals: [],
  adminAlerts: [],
  projectSubmissions: [],
  projectInvestors: {},
  investmentCertificates: [],
});

const InvestorDataContext = createContext<InvestorDataContextValue | undefined>(undefined);

export function InvestorDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PlatformData>(() => createInitialState());

  const updateData = (partial: Partial<PlatformData>) => {
    setData((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const recordInvestment = ({ project, amount, tokens, txHash, investorId, investorName }: RecordInvestmentPayload): InvestmentCertificate | null => {
    if (!project || amount <= 0 || tokens <= 0 || !investorId) {
      return null;
    }

    let generatedCertificate: InvestmentCertificate | null = null;
    setData((prev) => {
      const nextHoldings = [...(prev.holdings ?? [])];
      const holdingIndex = nextHoldings.findIndex((holding) => holding.projectId === project.id);
      const expectedPayout = amount * (1 + project.roi / 100);
      const maturityDate = (() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + project.tenure);
        return date.toLocaleDateString("en-IN");
      })();

      if (holdingIndex >= 0) {
        const existing = nextHoldings[holdingIndex];
        const updatedHolding: PortfolioHolding = {
          ...existing,
          tokens: existing.tokens + tokens,
          invested: existing.invested + amount,
          currentValue: (existing.currentValue ?? existing.invested) + amount,
          expectedPayout: (existing.expectedPayout ?? existing.invested) + expectedPayout,
          maturityDate: existing.maturityDate ?? maturityDate,
        };
        nextHoldings[holdingIndex] = updatedHolding;
      } else {
        nextHoldings.push({
          projectId: project.id,
          tokens,
          invested: amount,
          currentValue: amount,
          expectedPayout,
          maturityDate,
        });
      }

      const resolvedTxHash = txHash ?? `0x${cryptoRandom()}`;
      const tx: InvestorTransaction = {
        id: `tx-${Date.now().toString(36)}`,
        timestamp: new Date().toLocaleString("en-IN"),
        projectId: project.id,
        projectName: project.name,
        type: "buy",
        tokens,
        price: project.tokenPrice,
        status: "completed",
        txHash: resolvedTxHash,
      };

      const nextTransactions = [tx, ...(prev.transactions ?? [])];

      const issuedAt = new Date().toISOString();
      const certificateId = `cert-${Date.now().toString(36)}-${cryptoRandom()}`;
      const sanitizedProjectName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const certificateFileName = `${sanitizedProjectName || "investment"}-${certificateId}.txt`;
      const certificateContent = [
        "InfraBondX Investment Certificate",
        "----------------------------------",
        `Project: ${project.name}`,
        `Issuer: ${project.issuerName}`,
        `Investor: ${investorName ?? investorId}`,
        `Tokens Minted: ${tokens}`,
        `Amount Locked: ₹${amount.toLocaleString("en-IN")}`,
        `ROI (P.A.): ${project.roi}%`,
        `Tenure: ${project.tenure} years`,
        `Transaction Hash: ${resolvedTxHash}`,
        `Issued At: ${new Date(issuedAt).toLocaleString("en-IN")}`,
        "\nThis autogenerated certificate is for demo purposes only.",
      ].join("\n");
      const certificateDownloadUrl =
        typeof window !== "undefined" && typeof URL !== "undefined"
          ? URL.createObjectURL(new Blob([certificateContent], { type: "text/plain" }))
          : undefined;

      const certificate: InvestmentCertificate = {
        id: certificateId,
        projectId: project.id,
        projectName: project.name,
        issuerId: project.issuerId,
        issuerName: project.issuerName,
        investorId,
        investorName: investorName ?? investorId,
        tokens,
        amount,
        issuedAt,
        txHash: resolvedTxHash,
        fileName: certificateFileName,
        downloadUrl: certificateDownloadUrl,
      };

      generatedCertificate = certificate;

      const investorMap = { ...(prev.projectInvestors ?? {}) };
      const existingInvestors = new Set(investorMap[project.id] ?? []);
      existingInvestors.add(investorId);
      investorMap[project.id] = Array.from(existingInvestors);

      const prevMetrics = prev.metrics ?? {};
      const previousInvestment = prevMetrics.totalInvested ?? 0;
      const totalInvested = previousInvestment + amount;
      const weightedRoiNumerator = (prevMetrics.averageRoi ?? 0) * previousInvestment + project.roi * amount;
      const nextMetrics: InvestorMetrics = {
        totalInvested,
        tokensOwned: (prevMetrics.tokensOwned ?? 0) + tokens,
        expectedReturns: (prevMetrics.expectedReturns ?? 0) + expectedPayout,
        averageRoi: totalInvested > 0 ? weightedRoiNumerator / totalInvested : project.roi,
      };

      const nextProjects = (prev.projects ?? []).map((existingProject) =>
        existingProject.id === project.id
          ? { ...existingProject, fundingRaised: existingProject.fundingRaised + amount }
          : existingProject
      );

      return {
        ...prev,
        holdings: nextHoldings,
        transactions: nextTransactions,
        metrics: nextMetrics,
        projects: nextProjects,
        projectInvestors: investorMap,
        investmentCertificates: [certificate, ...(prev.investmentCertificates ?? [])],
      };
    });

    return generatedCertificate;
  };

  const submitMilestoneProof = ({ projectId, milestoneId, files, notes }: SubmitMilestoneProofPayload) => {
    if (!projectId || !milestoneId) {
      return;
    }

    setData((prev) => {
      const nextProjects = (prev.projects ?? []).map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        const submissionTimestamp = new Date().toISOString();
        const nextMilestones = (project.milestones ?? []).map((milestone) => {
          if (milestone.id !== milestoneId) {
            return milestone;
          }

          const preparedProofs: MilestoneProof[] = files
            .filter((entry) => entry.file)
            .map((entry) => ({
              id: `proof-${Date.now().toString(36)}-${cryptoRandom()}`,
              label: entry.label,
              fileName: entry.file.name,
              sizeBytes: entry.file.size,
              uploadedAt: submissionTimestamp,
              previewUrl:
                typeof window !== "undefined" && typeof URL !== "undefined"
                  ? URL.createObjectURL(entry.file)
                  : undefined,
            }));

          if (preparedProofs.length === 0 && !notes) {
            return milestone;
          }

          const updatedMilestone: Milestone = {
            ...milestone,
            status: preparedProofs.length > 0 ? "in-progress" : milestone.status,
            proofStatus: preparedProofs.length > 0 ? "submitted" : milestone.proofStatus,
            proofUploads: [...(milestone.proofUploads ?? []), ...preparedProofs],
            lastProofAt: preparedProofs.length > 0 ? submissionTimestamp : milestone.lastProofAt,
            proofNotes: notes ?? milestone.proofNotes,
          };

          return updatedMilestone;
        });

        return {
          ...project,
          milestones: nextMilestones,
        };
      });

      return {
        ...prev,
        projects: nextProjects,
      };
    });
  };

  const reviewMilestoneProof = ({ projectId, milestoneId, decision, notes }: ReviewMilestoneProofPayload) => {
    if (!projectId || !milestoneId) {
      return;
    }

    setData((prev) => {
      const nextProjects = (prev.projects ?? []).map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        const reviewTimestamp = new Date().toISOString();
        const nextMilestones = (project.milestones ?? []).map((milestone) => {
          if (milestone.id !== milestoneId) {
            return milestone;
          }

          const approved = decision === "approved";
          const reviewedMilestone: Milestone = {
            ...milestone,
            status: approved ? "completed" : "in-progress",
            proofStatus: approved ? "approved" : "rejected",
            lastProofAt: reviewTimestamp,
            proofNotes: notes ?? milestone.proofNotes,
          };

          return reviewedMilestone;
        });

        return {
          ...project,
          milestones: nextMilestones,
        };
      });

      return {
        ...prev,
        projects: nextProjects,
      };
    });
  };

  const submitProject = (input: ProjectSubmissionInput): ProjectSubmission => {
    const submission: ProjectSubmission = {
      id: `submission-${Date.now().toString(36)}`,
      status: "pending",
      submittedAt: new Date().toISOString(),
      ...input,
      documents: input.documents.map((doc) => ({ ...doc })),
      milestones: input.milestones.map((milestone) => ({ ...milestone })),
    };
    setData((prev) => ({
      ...prev,
      projectSubmissions: [...(prev.projectSubmissions ?? []), submission],
    }));
    return submission;
  };

  const approveProject = (submissionId: string) => {
    setData((prev) => {
      const submissions = prev.projectSubmissions ?? [];
      const submissionIndex = submissions.findIndex((item) => item.id === submissionId);
      if (submissionIndex === -1) {
        return prev;
      }

      const submission = submissions[submissionIndex];
      if (submission.status !== "pending") {
        return prev;
      }

      const updatedSubmission: ProjectSubmission = {
        ...submission,
        status: "approved",
        approvedAt: new Date().toISOString(),
      };

      const normalizedProjectId = `project-${submission.id}`;
      const derivedProject: Project = {
        id: normalizedProjectId,
        name: submission.name,
        location: submission.location,
        category: submission.category,
        description: submission.description,
        fundingTarget: submission.fundingTarget,
        fundingRaised: 0,
        roi: submission.roi,
        tenure: submission.tenure,
        tokenPrice: submission.tokenPrice,
        riskScore: 55,
        issuerId: submission.issuerId,
        issuerName: submission.issuerName,
        issuerVerified: true,
        milestones: submission.milestones.map((milestone) => ({ ...milestone })),
        status: "active",
      };

      const nextSubmissions = [...submissions];
      nextSubmissions[submissionIndex] = updatedSubmission;

      const existingProjectIndex = prev.projects?.findIndex((project) => project.id === normalizedProjectId) ?? -1;
      const nextProjects = [...(prev.projects ?? [])];
      if (existingProjectIndex === -1) {
        nextProjects.push(derivedProject);
      } else {
        nextProjects[existingProjectIndex] = derivedProject;
      }

      return {
        ...prev,
        projectSubmissions: nextSubmissions,
        projects: nextProjects,
      };
    });
  };

  const rejectProject = (submissionId: string, reason?: string) => {
    setData((prev) => {
      const submissions = prev.projectSubmissions ?? [];
      const submissionIndex = submissions.findIndex((item) => item.id === submissionId);
      if (submissionIndex === -1) {
        return prev;
      }

      const submission = submissions[submissionIndex];
      if (submission.status !== "pending") {
        return prev;
      }

      const updatedSubmission: ProjectSubmission = {
        ...submission,
        status: "rejected",
        rejectionReason: reason,
      };

      const nextSubmissions = [...submissions];
      nextSubmissions[submissionIndex] = updatedSubmission;

      return {
        ...prev,
        projectSubmissions: nextSubmissions,
      };
    });
  };

  const resetData = () => setData(createInitialState());

  const value = useMemo(
    () => ({
      data,
      updateData,
      resetData,
      recordInvestment,
      submitMilestoneProof,
      reviewMilestoneProof,
      submitProject,
      approveProject,
      rejectProject,
    }),
    [data]
  );

  return <InvestorDataContext.Provider value={value}>{children}</InvestorDataContext.Provider>;
}

export function useInvestorData() {
  const context = useContext(InvestorDataContext);
  if (!context) {
    throw new Error("useInvestorData must be used within InvestorDataProvider");
  }
  return context;
}

export const usePlatformData = useInvestorData;

const cryptoRandom = () => Math.random().toString(16).substring(2, 10);
