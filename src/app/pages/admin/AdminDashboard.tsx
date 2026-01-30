import { useMemo, useState } from "react";
import { Shield, AlertTriangle, CheckCircle, FileCheck, Users, Briefcase, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Textarea } from "@/app/components/ui/textarea";
import { usePlatformData } from "@/contexts/InvestorDataContext";
import type { MilestoneProof } from "@/app/components/MilestoneStepper";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

interface PendingMilestoneProof {
  projectId: string;
  projectName: string;
  issuerName: string;
  milestoneId: string;
  milestoneName: string;
  dueDate?: string;
  escrowRelease?: number;
  proofUploads: MilestoneProof[];
  proofNotes?: string;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { data, reviewMilestoneProof } = usePlatformData();
  const projects = data.projects ?? [];
  const platformMetrics = data.adminMetrics ?? [];
  const submissions = data.projectSubmissions ?? [];
  const pendingSubmissions = submissions.filter((submission) => submission.status === "pending");
  const pendingApprovalsFallback = data.adminPendingApprovals ?? [];
  const derivedPendingApprovals = pendingSubmissions.map((submission) => ({
    id: submission.id,
    type: "Project Listing",
    entity: `${submission.name} • ${submission.issuerName}`,
    submitted: new Date(submission.submittedAt).toLocaleDateString(),
    priority: "medium" as const,
  }));
  const pendingApprovals = derivedPendingApprovals.length > 0 ? derivedPendingApprovals : pendingApprovalsFallback;
  const recentAlerts = data.adminAlerts ?? [];
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const pendingMilestoneProofs = useMemo<PendingMilestoneProof[]>(
    () =>
      projects.flatMap((project) =>
        (project.milestones ?? [])
          .filter((milestone) => milestone.proofStatus === "submitted" && (milestone.proofUploads?.length ?? 0) > 0)
          .map((milestone) => ({
            projectId: project.id,
            projectName: project.name,
            issuerName: project.issuerName,
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            dueDate: milestone.date,
            escrowRelease: milestone.escrowRelease,
            proofUploads: milestone.proofUploads ?? [],
            proofNotes: milestone.proofNotes,
          }))
      ),
    [projects]
  );

  const derivedSummary = useMemo(() => {
    if (projects.length === 0) {
      return undefined;
    }
    const totalFundingRaised = projects.reduce((acc, project) => acc + project.fundingRaised, 0);
    const totalInvestors = projects.reduce(
      (acc, project) => acc + (project.tokenPrice ? project.fundingRaised / project.tokenPrice : 0),
      0
    );
    const milestoneCounts = projects.reduce(
      (acc, project) => {
        const milestones = project.milestones ?? [];
        acc.total += milestones.length;
        acc.completed += milestones.filter((milestone) => milestone.status === "completed").length;
        acc.escrowReleased +=
          (project.fundingRaised *
            milestones
              .filter((milestone) => milestone.status === "completed")
              .reduce((sum, milestone) => sum + (milestone.escrowRelease ?? 0), 0)) /
          100;
        return acc;
      },
      { total: 0, completed: 0, escrowReleased: 0 }
    );

    return {
      totalFundingRaised,
      totalInvestors,
      milestoneSuccessRate:
        milestoneCounts.total > 0
          ? (milestoneCounts.completed / milestoneCounts.total) * 100
          : undefined,
      escrowReleased: milestoneCounts.escrowReleased,
    };
  }, [projects]);

  const summary = {
    activeProjects: data.adminSummary?.activeProjects ?? projects.length,
    verifiedIssuers: data.adminSummary?.verifiedIssuers,
    pendingApprovals:
      data.adminSummary?.pendingApprovals ?? (derivedPendingApprovals.length || pendingApprovalsFallback.length),
    fraudAlerts: data.adminSummary?.fraudAlerts ?? recentAlerts.filter((alert) => alert.type === "warning").length,
    totalFundingRaised: data.adminSummary?.totalFundingRaised ?? derivedSummary?.totalFundingRaised,
    totalInvestors: data.adminSummary?.totalInvestors ?? derivedSummary?.totalInvestors,
    milestoneSuccessRate:
      data.adminSummary?.milestoneSuccessRate ?? derivedSummary?.milestoneSuccessRate,
    escrowReleased: data.adminSummary?.escrowReleased ?? derivedSummary?.escrowReleased,
  };

  const formatNumber = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatPercent = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return `${value.toFixed(1)}%`;
  };

  const handleMilestoneDecision = (entry: PendingMilestoneProof, decision: "approved" | "rejected") => {
    const entryKey = `${entry.projectId}-${entry.milestoneId}`;
    reviewMilestoneProof({
      projectId: entry.projectId,
      milestoneId: entry.milestoneId,
      decision,
      notes: reviewNotes[entryKey]?.trim() || undefined,
    });
    setReviewNotes((prev) => ({
      ...prev,
      [entryKey]: "",
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Platform Administration</h1>
        <p className="text-muted-foreground">Monitor platform health, verify entities, and manage approvals</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <ImpactCard
          icon={Briefcase}
          label="Active Projects"
          value={formatNumber(summary.activeProjects)}
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Shield}
          label="Verified Issuers"
          value={formatNumber(summary.verifiedIssuers)}
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={FileCheck}
          label="Pending Approvals"
          value={formatNumber(summary.pendingApprovals)}
          color="text-[#f59e0b]"
          className="border-l-[#f59e0b]"
        />
        <ImpactCard
          icon={AlertTriangle}
          label="Fraud Alerts"
          value={formatNumber(summary.fraudAlerts)}
          color="text-[#dc2626]"
          className="border-l-[#dc2626]"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Funding Growth (₹Cr)</CardTitle>
          </CardHeader>
          <CardContent>
            {platformMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={platformMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="funding" stroke="#0c4a6e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Connect platform analytics to plot funding growth." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects Count</CardTitle>
          </CardHeader>
          <CardContent>
            {platformMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={platformMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projects" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Projects per month will display once monitoring is enabled." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals & Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                {pendingApprovals.length === 0 && (
                  <EmptyState message="No pending approvals. New submissions will appear here." />
                )}
                {pendingApprovals.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{item.type}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.priority === "high"
                              ? "bg-[#dc2626]/10 text-[#dc2626]"
                              : "bg-[#f59e0b]/10 text-[#f59e0b]"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.entity}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.submitted}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onNavigate(
                          item.type.includes("Issuer") ? "verify-issuers" : "approve-projects"
                        )
                      }
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("approve-projects")}
              >
                View All Approvals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Alerts & Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.length === 0 && (
                <EmptyState message="Security and activity alerts will appear once monitoring inputs are configured." />
              )}
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {alert.type === "warning" && (
                        <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                      )}
                      {alert.type === "success" && (
                        <CheckCircle className="w-4 h-4 text-[#10b981]" />
                      )}
                      {alert.type === "info" && <Shield className="w-4 h-4 text-[#0ea5e9]" />}
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate("fraud-monitoring")}
              >
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Milestone Proof Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingMilestoneProofs.length === 0 ? (
            <EmptyState message="No milestone proofs awaiting verification." />
          ) : (
            <div className="space-y-4">
              {pendingMilestoneProofs.map((entry) => {
                const entryKey = `${entry.projectId}-${entry.milestoneId}`;
                return (
                  <div key={entryKey} className="p-4 border rounded-lg space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold">{entry.projectName}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.milestoneName} • {entry.issuerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.dueDate ? `Due ${entry.dueDate}` : "No due date provided"}
                        </p>
                      </div>
                      {typeof entry.escrowRelease === "number" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">
                          {entry.escrowRelease}% escrow
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {entry.proofUploads.map((proof) => (
                        <div
                          key={proof.id}
                          className="p-3 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">{proof.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {proof.fileName}
                              {typeof proof.sizeBytes === "number" && ` • ${(proof.sizeBytes / 1024).toFixed(1)} KB`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {new Date(proof.uploadedAt).toLocaleString("en-IN")}
                            </p>
                          </div>
                          {proof.previewUrl && (
                            <Button asChild size="sm" variant="outline">
                              <a
                                href={proof.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                download={`${entry.milestoneName}-${proof.fileName}`}
                              >
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Textarea
                      placeholder="Add admin notes or conditions (optional)"
                      value={reviewNotes[entryKey] ?? ""}
                      onChange={(event) =>
                        setReviewNotes((prev) => ({
                          ...prev,
                          [entryKey]: event.target.value,
                        }))
                      }
                    />

                    <div className="flex flex-col md:flex-row gap-3">
                      <Button
                        className="flex-1"
                        variant="success"
                        onClick={() => handleMilestoneDecision(entry, "approved")}
                      >
                        Approve Milestone
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={() => handleMilestoneDecision(entry, "rejected")}
                      >
                        Request Revisions
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 bg-accent rounded-lg text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(summary.totalFundingRaised)}</p>
              <p className="text-sm text-muted-foreground">Total Funding Raised</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <Users className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatNumber(summary.totalInvestors)}</p>
              <p className="text-sm text-muted-foreground">Total Investors</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatPercent(summary.milestoneSuccessRate)}</p>
              <p className="text-sm text-muted-foreground">Milestone Success Rate</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <Activity className="w-8 h-8 text-[#8b5cf6] mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(summary.escrowReleased)}</p>
              <p className="text-sm text-muted-foreground">Escrow Released</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground text-center py-6">{message}</p>;
}
