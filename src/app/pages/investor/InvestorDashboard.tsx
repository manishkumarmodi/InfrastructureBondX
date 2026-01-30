import { useMemo } from "react";
import { Wallet, TrendingUp, Target, Bell, Activity, Building2, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInvestorData } from "@/contexts/InvestorDataContext";
import type { Project } from "@/types/project";

interface InvestorDashboardProps {
  onNavigate: (page: string) => void;
}

export function InvestorDashboard({ onNavigate }: InvestorDashboardProps) {
  const { data } = useInvestorData();
  const metrics = data.metrics;
  const portfolioTrend = data.portfolioTrend ?? [];
  const riskBreakdown = data.riskBreakdown ?? [];
  const notifications = data.notifications ?? [];
  const recommendations = data.recommendations ?? [];

  const projectLookup = useMemo(() => {
    const map = new Map<string, Project>();
    (data.projects ?? []).forEach((project) => map.set(project.id, project));
    return map;
  }, [data.projects]);

  const resolvedRecommendations = recommendations.map((rec) => ({
    ...rec,
    project: projectLookup.get(rec.projectId),
  }));

  const riskPalette = ["#10b981", "#f59e0b", "#dc2626", "#0ea5e9", "#8b5cf6"];
  const formattedRisk = riskBreakdown.map((slice, index) => ({
    ...slice,
    color: slice.color ?? riskPalette[index % riskPalette.length],
  }));

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") {
      return "—";
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatPercent = (value?: number) => {
    if (typeof value !== "number") {
      return "—";
    }
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Investment Dashboard</h1>
        <p className="text-muted-foreground">
          Track your portfolio, monitor milestones, and view your impact
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <ImpactCard
          icon={Wallet}
          label="Total Invested"
          value={formatCurrency(metrics?.totalInvested)}
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Coins}
          label="Tokens Owned"
          value={metrics?.tokensOwned ? metrics.tokensOwned.toLocaleString("en-IN") : "—"}
          color="text-[#0ea5e9]"
          className="border-l-[#0ea5e9]"
        />
        <ImpactCard
          icon={TrendingUp}
          label="Expected Returns"
          value={formatCurrency(metrics?.expectedReturns)}
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={Target}
          label="Avg. ROI"
          value={metrics?.averageRoi ? formatPercent(metrics.averageRoi) : "—"}
          color="text-[#8b5cf6]"
          className="border-l-[#8b5cf6]"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Portfolio Growth */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={portfolioTrend}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c4a6e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0c4a6e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0c4a6e"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Connect a data feed to visualize portfolio growth." />
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {formattedRisk.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={formattedRisk}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formattedRisk.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color as string} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {formattedRisk.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="Risk data will appear after the first investment." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impact Meter & Notifications */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Impact Meter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Your Impact Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Plug in verified sustainability metrics to quantify your infrastructure impact. Once
              connected, this module will visualize road kilometers built, renewable capacity
              added, jobs enabled, and emissions saved.
            </p>
            <Button variant="outline" onClick={() => onNavigate("portfolio")}>Add Impact Data</Button>
          </CardContent>
        </Card>

        {/* Live Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Live Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 && (
              <EmptyState message="Notifications will stream in once milestone webhooks are connected." />
            )}
            {notifications.map((notif) => (
              <div key={notif.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">{notif.title}</h4>
                  <span className="text-xs text-muted-foreground">{notif.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full" disabled={notifications.length === 0}>
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Recommended Projects for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resolvedRecommendations.length === 0 && (
              <EmptyState message="Personalized recommendations will appear after you add preferences." />
            )}
            {resolvedRecommendations.map((recommendation) => {
              const project = recommendation.project;
              if (!project) {
                return null;
              }

              return (
                <div
                  key={recommendation.projectId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                  onClick={() => onNavigate(`project-${project.id}`)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{project.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>ROI: {formatPercent(recommendation.roi ?? project.roi)}</span>
                      <span>Risk: {recommendation.riskScore ?? project.riskScore}/100</span>
                      {typeof recommendation.progress === "number" && (
                        <span>Progress: {recommendation.progress}%</span>
                      )}
                    </div>
                  </div>
                  <Button>View Details</Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground text-center py-6">{message}</p>;
}
