import { useMemo } from "react";
import { DollarSign, Users, Briefcase, TrendingUp, Calendar, FileText, Inbox, Clock5, CheckCircle2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePlatformData } from "@/contexts/InvestorDataContext";
import { useAuth } from "@/contexts/AuthContext";

interface IssuerDashboardProps {
  onNavigate: (page: string) => void;
}

export function IssuerDashboard({ onNavigate }: IssuerDashboardProps) {
  const { data } = usePlatformData();
  const { user } = useAuth();
  const investorMap = data.projectInvestors ?? {};
  const projects = useMemo(() => {
    if (!user?.id) {
      return [];
    }
    return (data.projects ?? []).filter((project) => project.issuerId === user.id);
  }, [data.projects, user?.id]);

  const submissions = useMemo(() => {
    if (!user?.id) {
      return [];
    }
    return (data.projectSubmissions ?? []).filter((submission) => submission.issuerId === user.id);
  }, [data.projectSubmissions, user?.id]);

  const derivedSummary = useMemo(() => {
    if (projects.length === 0) {
      return undefined;
    }

    const totals = projects.reduce(
      (acc, project) => {
        acc.funds += project.fundingRaised;
        const investorCount = investorMap[project.id]?.length ?? 0;
        acc.investors += investorCount > 0
          ? investorCount
          : project.tokenPrice
          ? project.fundingRaised / project.tokenPrice
          : 0;
        acc.progressSamples += project.fundingTarget
          ? project.fundingRaised / project.fundingTarget
          : 0;
        return acc;
      },
      { funds: 0, investors: 0, progressSamples: 0 }
    );

    return {
      totalFundsRaised: totals.funds,
      totalInvestors: totals.investors,
      activeProjects: projects.length,
      averageProgress: (totals.progressSamples / projects.length) * 100,
    };
  }, [projects]);

  const summary = {
    totalFunds: data.issuerSummary?.totalFundsRaised ?? derivedSummary?.totalFundsRaised,
    totalInvestors: data.issuerSummary?.totalInvestors ?? derivedSummary?.totalInvestors,
    activeProjects: data.issuerSummary?.activeProjects ?? derivedSummary?.activeProjects,
    averageProgress: data.issuerSummary?.averageProgress ?? derivedSummary?.averageProgress,
    organization:
      data.issuerSummary?.organizationName ?? "Connect your issuer profile to personalize this view",
  };

  const fundingTrend = data.issuerFundingTrend ?? [];
  const investorDemographics = data.issuerInvestorMix ?? [];

  const upcomingMilestones = useMemo(() => {
    if ((data.issuerUpcomingMilestones ?? []).length > 0) {
      return data.issuerUpcomingMilestones;
    }
    return projects
      .flatMap((project) =>
        (project.milestones ?? [])
          .filter((milestone) => milestone.status !== "completed")
          .map((milestone) => ({
            id: `${project.id}-${milestone.id}`,
            project: project.name,
            milestone: milestone.name,
            dueDate: milestone.date,
            status: milestone.status,
          }))
      )
      .slice(0, 4);
  }, [data.issuerUpcomingMilestones, projects]);

  const recentActivity = data.issuerRecentActivity ?? [];

  const submissionStats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((submission) => submission.status === "pending").length;
    const approved = submissions.filter((submission) => submission.status === "approved").length;
    const rejected = submissions.filter((submission) => submission.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [submissions]);

  const projectPerformance = useMemo(() => {
    if ((data.issuerProjectPerformance ?? []).length > 0) {
      return data.issuerProjectPerformance;
    }
    return projects.map((project) => ({
      projectId: project.id,
      projectName: project.name,
      fundingTarget: project.fundingTarget,
      fundingRaised: project.fundingRaised,
      progressPercent: project.fundingTarget
        ? (project.fundingRaised / project.fundingTarget) * 100
        : undefined,
      investors: investorMap[project.id]?.length ?? undefined,
    }));
  }, [data.issuerProjectPerformance, projects, investorMap]);

  const issuerCertificates = useMemo(() => {
    if (!user?.id) {
      return [];
    }
    return (data.investmentCertificates ?? []).filter((certificate) => certificate.issuerId === user.id);
  }, [data.investmentCertificates, user?.id]);

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatNumber = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const formatPercent = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Issuer Dashboard</h1>
          <p className="text-muted-foreground">{summary.organization}</p>
        </div>
        <Button onClick={() => onNavigate("create-bond")}>
          <FileText className="w-4 h-4 mr-2" />
          Create New Bond Listing
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <ImpactCard
          icon={DollarSign}
          label="Total Funds Raised"
          value={formatCurrency(summary.totalFunds)}
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Users}
          label="Total Investors"
          value={formatNumber(summary.totalInvestors)}
          color="text-[#0ea5e9]"
          className="border-l-[#0ea5e9]"
        />
        <ImpactCard
          icon={Briefcase}
          label="Active Projects"
          value={formatNumber(summary.activeProjects)}
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={TrendingUp}
          label="Avg. Project Progress"
          value={formatPercent(summary.averageProgress)}
          color="text-[#8b5cf6]"
          className="border-l-[#8b5cf6]"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Funding Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Funding Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {fundingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={fundingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0c4a6e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Connect your fundraising analytics to visualize trends." />
            )}
          </CardContent>
        </Card>

        {/* Investor Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Investor Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            {investorDemographics.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={investorDemographics}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {investorDemographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color ?? "#0ea5e9"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {investorDemographics.map((item) => (
                    <div key={item.label ?? item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color ?? "#0ea5e9" }}
                        />
                        <span>{item.label ?? item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="Investor mix will appear once CRM data is connected." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Milestones */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {upcomingMilestones.length === 0 && (
                  <EmptyState message="No pending milestones detected. Add project schedules to track them here." />
                )}
                {upcomingMilestones.map((milestone) => (
                  <div key={milestone?.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{milestone?.milestone ?? milestone?.milestoneName}</h4>
                        <p className="text-sm text-muted-foreground">{milestone?.project}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          milestone?.status === "in-progress"
                            ? "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {milestone?.status === "in-progress" ? "In Progress" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Due: {milestone?.dueDate ?? "TBD"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => onNavigate("milestones")}>
                        Upload Proof
                      </Button>
                    </div>
                  </div>
                ))}
              <Button variant="outline" className="w-full" onClick={() => onNavigate("milestones")}>
                View All Milestones
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 && (
                  <EmptyState message="Workflow events will appear when your issuer account is active." />
                )}
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.category ?? "Update"}</p>
                      <p className="text-xs text-muted-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="p-3 bg-accent rounded-lg">
                <Inbox className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-semibold">{submissionStats.total}</p>
                <p className="text-xs text-muted-foreground">Submitted</p>
              </div>
              <div className="p-3 bg-accent rounded-lg">
                <Clock5 className="w-5 h-5 text-[#f59e0b] mx-auto mb-1" />
                <p className="text-lg font-semibold">{submissionStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 bg-accent rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-[#10b981] mx-auto mb-1" />
                <p className="text-lg font-semibold">{submissionStats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
            <div className="space-y-3">
              {submissions.length === 0 && (
                <EmptyState message="Submitted listings will appear here for tracking." />
              )}
              {submissions.slice(0, 3).map((submission) => (
                <div key={submission.id} className="p-3 border rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{submission.name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        submission.status === "approved"
                          ? "bg-[#10b981]/10 text-[#10b981]"
                          : submission.status === "rejected"
                          ? "bg-[#dc2626]/10 text-[#dc2626]"
                          : "bg-[#f59e0b]/10 text-[#f59e0b]"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => onNavigate("create-bond")}>
              Submit New Project
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" /> Recent Investor Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {issuerCertificates.length === 0 ? (
            <EmptyState message="Certificates will appear after investors fund your projects." />
          ) : (
            <div className="space-y-3">
              {issuerCertificates.slice(0, 5).map((certificate) => (
                <div key={certificate.id} className="p-3 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-medium">{certificate.projectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {certificate.investorName} • ₹{certificate.amount.toLocaleString("en-IN")} •
                      {" "}
                      {new Date(certificate.issuedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  {certificate.downloadUrl ? (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={certificate.downloadUrl}
                        download={certificate.fileName}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Certificate link unavailable</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Project Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Target
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Raised
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Investors
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectPerformance.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                      Add a project listing to see performance metrics.
                    </td>
                  </tr>
                )}
                {projectPerformance.map((project) => (
                  <tr key={project.projectId} className="border-b hover:bg-accent">
                    <td className="py-4 px-4">
                      <p className="font-medium">{project.projectName}</p>
                    </td>
                    <td className="py-4 px-4 text-right">{formatCurrency(project.fundingTarget)}</td>
                    <td className="py-4 px-4 text-right font-medium">
                      {formatCurrency(project.fundingRaised)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[#10b981]">{formatPercent(project.progressPercent)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatNumber(project.investors)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => onNavigate("milestones")}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{message}</p>;
}
