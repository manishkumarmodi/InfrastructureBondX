import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Project } from "@/types/project";
import type { Milestone, MilestoneProof } from "@/app/components/MilestoneStepper";
import { apiRequest } from "@/lib/api";
import { useAuth } from "./AuthContext";

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
  recordInvestment: (payload: RecordInvestmentPayload) => Promise<InvestmentCertificate | null>;
  submitProject: (input: ProjectSubmissionInput) => Promise<ProjectSubmission>;
  approveProject: (submissionId: string) => Promise<void>;
  rejectProject: (submissionId: string, reason?: string) => Promise<void>;
  submitMilestoneProof: (payload: SubmitMilestoneProofPayload) => Promise<void>;
  reviewMilestoneProof: (payload: ReviewMilestoneProofPayload) => Promise<void>;
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
  const { user, token } = useAuth();
  const [data, setData] = useState<PlatformData>(() => createInitialState());

  const updateData = useCallback((partial: Partial<PlatformData>) => {
    setData((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  const resetData = useCallback(() => {
    setData(createInitialState());
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const projects = await apiRequest<any[]>("/projects");
      setData((prev) => ({
        ...prev,
        projects: projects.map(normalizeProject),
      }));
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  }, []);

  const fetchInvestorData = useCallback(async () => {
    if (!token || !user || user.role !== "investor") {
      return;
    }
    try {
      const [holdings, transactions] = await Promise.all([
        apiRequest<any[]>(`/investors/${user.id}/portfolio`, { authToken: token }),
        apiRequest<any[]>(`/investors/${user.id}/transactions`, { authToken: token }),
      ]);
      const normalizedHoldings = holdings.map(normalizeHolding);
      const normalizedTransactions = transactions.map(normalizeTransaction);
      setData((prev) => ({
        ...prev,
        holdings: normalizedHoldings,
        transactions: normalizedTransactions,
        metrics: deriveInvestorMetrics(normalizedHoldings),
      }));
    } catch (error) {
      console.error("Failed to fetch investor data", error);
    }
  }, [token, user]);

  const fetchIssuerData = useCallback(async () => {
    if (!token || !user || user.role !== "issuer") {
      return;
    }
    try {
      const [summary, submissions] = await Promise.all([
        apiRequest<IssuerSummaryMetrics>(`/issuers/${user.id}/summary`, { authToken: token }),
        apiRequest<any[]>("/issuers/submissions/mine", { authToken: token }),
      ]);
      setData((prev) => ({
        ...prev,
        issuerSummary: summary,
        projectSubmissions: submissions.map(normalizeSubmission),
      }));
    } catch (error) {
      console.error("Failed to fetch issuer data", error);
    }
  }, [token, user]);

  const fetchAdminData = useCallback(async () => {
    if (!token || !user || user.role !== "admin") {
      return;
    }
    try {
      const [summary, submissions] = await Promise.all([
        apiRequest<AdminSummaryMetrics>("/admin/summary", { authToken: token }),
        apiRequest<any[]>("/admin/submissions", { authToken: token }),
      ]);
      setData((prev) => ({
        ...prev,
        adminSummary: summary,
        projectSubmissions: submissions.map(normalizeSubmission),
      }));
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  }, [token, user]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!token || !user) {
      setData((prev) => ({
        ...createInitialState(),
        projects: prev.projects ?? [],
      }));
      return;
    }

    if (user.role === "investor") {
      void fetchInvestorData();
    } else if (user.role === "issuer") {
      void fetchIssuerData();
    } else if (user.role === "admin") {
      void fetchAdminData();
    }
  }, [token, user, fetchAdminData, fetchInvestorData, fetchIssuerData]);

  const recordInvestment = useCallback(
    async (payload: RecordInvestmentPayload) => {
      if (!token || !user) {
        throw new Error("Unauthorized");
      }
      if (!payload.project || payload.amount <= 0 || payload.tokens <= 0 || !payload.investorId) {
        return null;
      }

      try {
        const response = await apiRequest<any>("/investors/investments", {
          method: "POST",
          authToken: token,
          body: {
            projectId: payload.project.id,
            amount: payload.amount,
            tokens: payload.tokens,
          },
        });

        await fetchInvestorData();
        await fetchProjects();

        const resolvedHash = payload.txHash ?? response.txHash ?? `0x${cryptoRandom()}`;
        const certificate = generateCertificate({ ...payload, txHash: resolvedHash });

        setData((prev) => {
          const investorMap = { ...(prev.projectInvestors ?? {}) };
          const existingInvestors = new Set(investorMap[payload.project.id] ?? []);
          existingInvestors.add(payload.investorId);
          investorMap[payload.project.id] = Array.from(existingInvestors);

          return {
            ...prev,
            investmentCertificates: [certificate, ...(prev.investmentCertificates ?? [])],
            projectInvestors: investorMap,
          };
        });

        return certificate;
      } catch (error) {
        console.error("Failed to record investment", error);
        throw error;
      }
    },
    [fetchInvestorData, fetchProjects, token, user]
  );

  const submitProject = useCallback(
    async (input: ProjectSubmissionInput) => {
      if (!token || !user || user.role !== "issuer") {
        throw new Error("Unauthorized");
      }
      try {
        const response = await apiRequest<any>("/issuers/submissions", {
          method: "POST",
          authToken: token,
          body: serializeSubmissionInput(input),
        });
        const submission = normalizeSubmission(response);
        setData((prev) => ({
          ...prev,
          projectSubmissions: [submission, ...(prev.projectSubmissions ?? [])],
        }));
        return submission;
      } catch (error) {
        console.error("Failed to submit project", error);
        throw error;
      }
    },
    [token, user]
  );

  const approveProject = useCallback(
    async (submissionId: string) => {
      if (!token || !user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      try {
        await apiRequest(`/admin/submissions/${submissionId}/approve`, {
          method: "PATCH",
          authToken: token,
        });
        await Promise.all([fetchAdminData(), fetchProjects()]);
      } catch (error) {
        console.error("Failed to approve project", error);
        throw error;
      }
    },
    [fetchAdminData, fetchProjects, token, user]
  );

  const rejectProject = useCallback(
    async (submissionId: string, reason?: string) => {
      if (!token || !user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      try {
        await apiRequest(`/admin/submissions/${submissionId}/reject`, {
          method: "PATCH",
          authToken: token,
          body: { reason },
        });
        await fetchAdminData();
      } catch (error) {
        console.error("Failed to reject project", error);
        throw error;
      }
    },
    [fetchAdminData, token, user]
  );

  const submitMilestoneProof = useCallback(
    async ({ projectId, milestoneId, files, notes }: SubmitMilestoneProofPayload) => {
      if (!token || !user) {
        throw new Error("Unauthorized");
      }
      try {
        const serializedFiles = await Promise.all(
          files
            .filter((entry) => entry.file)
            .map(async (entry) => ({
              label: entry.label,
              fileName: entry.file.name,
              sizeBytes: entry.file.size,
              previewUrl: await fileToDataUrl(entry.file),
            }))
        );

        await apiRequest(`/projects/${projectId}/milestones/${milestoneId}/proofs`, {
          method: "POST",
          authToken: token,
          body: { files: serializedFiles, notes },
        });

        await fetchProjects();
      } catch (error) {
        console.error("Failed to submit milestone proof", error);
        throw error;
      }
    },
    [fetchProjects, token, user]
  );

  const reviewMilestoneProof = useCallback(
    async ({ projectId, milestoneId, decision, notes }: ReviewMilestoneProofPayload) => {
      if (!token || !user || user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      try {
        await apiRequest(`/projects/${projectId}/milestones/${milestoneId}/review`, {
          method: "POST",
          authToken: token,
          body: { decision, notes },
        });

        setData((prev) => {
          const currentProjects = prev.projects ?? [];
          const nextProjects = currentProjects.map((project) => {
            if (project.id !== projectId) {
              return project;
            }
            return {
              ...project,
              milestones: (project.milestones ?? []).map((milestone) =>
                milestone.id === milestoneId
                  ? {
                      ...milestone,
                      status: decision === "approved" ? "completed" : "in-progress",
                      proofStatus: decision === "approved" ? "approved" : "rejected",
                      proofNotes: notes ?? milestone.proofNotes,
                      lastProofAt: new Date().toISOString(),
                    }
                  : milestone
              ),
            };
          });
          return {
            ...prev,
            projects: nextProjects,
          };
        });

        await fetchProjects();
        await fetchAdminData();
      } catch (error) {
        console.error("Failed to review milestone proof", error);
        throw error;
      }
    },
    [fetchAdminData, fetchProjects, token, user]
  );

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
    [approveProject, data, recordInvestment, rejectProject, resetData, submitMilestoneProof, submitProject, reviewMilestoneProof, updateData]
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

function normalizeProject(project: any): Project {
  return {
    id: project.id ?? project._id ?? cryptoRandom(),
    name: project.name,
    location: project.location,
    category: project.category,
    description: project.description,
    fundingTarget: Number(project.fundingTarget ?? 0),
    fundingRaised: Number(project.fundingRaised ?? 0),
    roi: Number(project.roi ?? 0),
    tenure: Number(project.tenure ?? 0),
    tokenPrice: Number(project.tokenPrice ?? 0),
    riskScore: Number(project.riskScore ?? 0),
    issuerId:
      typeof project.issuer === "string"
        ? project.issuer
        : project.issuer?._id ?? project.issuerId ?? "",
    issuerName: project.issuerName ?? project.issuer?.name ?? "Issuer",
    issuerVerified: Boolean(project.issuerVerified),
    milestones: (project.milestones ?? []).map(normalizeMilestone),
    status: project.status ?? "pending",
    image: project.image,
  };
}

function normalizeMilestone(milestone: any): Milestone {
  return {
    id: milestone.id ?? milestone._id ?? cryptoRandom(),
    name: milestone.name ?? "Milestone",
    status: milestone.status ?? "pending",
    date: milestone.date ?? milestone.dueDate,
    escrowRelease: milestone.escrowRelease,
    proofStatus: milestone.proofStatus,
    proofUploads: (milestone.proofUploads ?? []).map(normalizeProof),
    lastProofAt: milestone.lastProofAt,
    proofNotes: milestone.proofNotes,
  };
}

function normalizeProof(proof: any): MilestoneProof {
  return {
    id: proof.id ?? proof._id ?? cryptoRandom(),
    label: proof.label ?? "Proof",
    fileName: proof.fileName ?? "document",
    sizeBytes: proof.sizeBytes,
    uploadedAt: proof.uploadedAt ?? new Date().toISOString(),
    previewUrl: proof.previewUrl,
  };
}

function normalizeSubmission(entry: any): ProjectSubmission {
  return {
    id: entry.id ?? entry._id ?? cryptoRandom(),
    name: entry.name,
    category: entry.category,
    location: entry.location,
    description: entry.description,
    fundingTarget: Number(entry.fundingTarget ?? 0),
    roi: Number(entry.roi ?? 0),
    tenure: Number(entry.tenure ?? 0),
    tokenPrice: Number(entry.tokenPrice ?? 0),
    milestones: (entry.milestones ?? []).map(normalizeMilestone),
    documents: (entry.documents ?? []).map((doc: any) => ({
      id: doc.id ?? doc._id ?? cryptoRandom(),
      label: doc.label ?? "Document",
      uploaded: doc.uploaded ?? Boolean(doc.fileName),
      fileName: doc.fileName,
      previewUrl: doc.previewUrl,
      sizeBytes: doc.sizeBytes,
    })),
    issuerId:
      typeof entry.issuer === "string"
        ? entry.issuer
        : entry.issuer?._id ?? entry.issuerId ?? "",
    issuerName: entry.issuerName ?? entry.issuer?.name ?? "Issuer",
    status: entry.status ?? "pending",
    submittedAt: entry.submittedAt ?? entry.createdAt ?? new Date().toISOString(),
    approvedAt: entry.approvedAt,
    rejectionReason: entry.rejectionReason,
  };
}

function serializeSubmissionInput(input: ProjectSubmissionInput) {
  return {
    name: input.name,
    category: input.category,
    location: input.location,
    description: input.description,
    fundingTarget: input.fundingTarget,
    roi: input.roi,
    tenure: input.tenure,
    tokenPrice: input.tokenPrice,
    milestones: input.milestones,
    documents: (input.documents ?? []).map((doc) => ({
      id: doc.id,
      label: doc.label,
      uploaded: doc.uploaded,
      fileName: doc.fileName,
      previewUrl: doc.previewUrl,
      sizeBytes: doc.sizeBytes,
    })),
    issuerId: input.issuerId,
    issuerName: input.issuerName,
  };
}

function normalizeHolding(entry: any): PortfolioHolding {
  return {
    projectId:
      entry.projectId ?? (typeof entry.project === "string" ? entry.project : entry.project?._id) ?? cryptoRandom(),
    tokens: Number(entry.tokens ?? 0),
    invested: Number(entry.invested ?? entry.amount ?? 0),
    currentValue: Number(entry.currentValue ?? entry.amount ?? 0),
    expectedPayout: Number(entry.expectedPayout ?? entry.amount ?? 0),
    maturityDate:
      typeof entry.maturityDate === "string"
        ? entry.maturityDate
        : entry.maturityDate
        ? new Date(entry.maturityDate).toISOString()
        : entry.project?.maturityDate
        ? new Date(entry.project.maturityDate).toISOString()
        : undefined,
  };
}

function normalizeTransaction(entry: any): InvestorTransaction {
  return {
    id: entry.id ?? entry._id ?? cryptoRandom(),
    timestamp: entry.timestamp ?? entry.createdAt ?? new Date().toISOString(),
    projectId:
      entry.projectId ?? (typeof entry.project === "string" ? entry.project : entry.project?._id) ?? cryptoRandom(),
    projectName: entry.projectName ?? entry.project?.name ?? "Project",
    type: "buy",
    tokens: Number(entry.tokens ?? 0),
    price: Number(entry.price ?? entry.project?.tokenPrice ?? 0),
    status: entry.status ?? "completed",
    txHash: entry.txHash ?? `0x${cryptoRandom()}`,
  };
}

function deriveInvestorMetrics(holdings: PortfolioHolding[]): InvestorMetrics | undefined {
  if (holdings.length === 0) {
    return undefined;
  }
  const totalInvested = holdings.reduce((sum, holding) => sum + holding.invested, 0);
  const tokensOwned = holdings.reduce((sum, holding) => sum + holding.tokens, 0);
  const expectedReturns = holdings.reduce((sum, holding) => sum + (holding.expectedPayout ?? 0), 0);
  const averageRoi = totalInvested > 0 ? (expectedReturns / totalInvested - 1) * 100 : undefined;

  return {
    totalInvested,
    tokensOwned,
    expectedReturns,
    averageRoi,
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function generateCertificate(params: RecordInvestmentPayload & { txHash: string }): InvestmentCertificate {
  const { project, amount, tokens, txHash, investorId, investorName } = params;
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
    `Transaction Hash: ${txHash}`,
    `Issued At: ${new Date(issuedAt).toLocaleString("en-IN")}`,
    "\nThis autogenerated certificate is for demo purposes only.",
  ].join("\n");
  const certificateDownloadUrl =
    typeof window !== "undefined" && typeof URL !== "undefined"
      ? URL.createObjectURL(new Blob([certificateContent], { type: "text/plain" }))
      : undefined;

  return {
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
    txHash,
    fileName: certificateFileName,
    downloadUrl: certificateDownloadUrl,
  };
}

const cryptoRandom = () => Math.random().toString(16).substring(2, 10);
