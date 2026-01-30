import { Shield, AlertTriangle, CheckCircle, FileCheck, Users, Briefcase, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const platformMetrics = [
    { month: "Aug", funding: 0, projects: 0 },
    { month: "Sep", funding: 15, projects: 2 },
    { month: "Oct", funding: 45, projects: 4 },
    { month: "Nov", funding: 95, projects: 5 },
    { month: "Dec", funding: 165, projects: 6 },
    { month: "Jan", funding: 250, projects: 6 },
  ];

  const pendingApprovals = [
    {
      id: "1",
      type: "Issuer Verification",
      entity: "Hyderabad Metro Rail Corp",
      submitted: "2 days ago",
      priority: "high",
    },
    {
      id: "2",
      type: "Project Approval",
      entity: "Kolkata Smart Water System",
      submitted: "4 hours ago",
      priority: "medium",
    },
    {
      id: "3",
      type: "Milestone Verification",
      entity: "Chennai Port - Phase 1 Complete",
      submitted: "1 day ago",
      priority: "high",
    },
  ];

  const recentAlerts = [
    {
      id: "1",
      type: "warning",
      message: "Unusual selling pattern detected in Project #proj-004",
      time: "30 mins ago",
    },
    {
      id: "2",
      type: "info",
      message: "New issuer registration: Delhi Transport Authority",
      time: "2 hours ago",
    },
    {
      id: "3",
      type: "success",
      message: "Milestone verified for Mumbai-Pune Expressway",
      time: "5 hours ago",
    },
  ];

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
          value="6"
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Shield}
          label="Verified Issuers"
          value="12"
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={FileCheck}
          label="Pending Approvals"
          value="3"
          color="text-[#f59e0b]"
          className="border-l-[#f59e0b]"
        />
        <ImpactCard
          icon={AlertTriangle}
          label="Fraud Alerts"
          value="1"
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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={platformMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="funding" stroke="#0c4a6e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="projects" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
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

      {/* Platform Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 bg-accent rounded-lg text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">₹250Cr</p>
              <p className="text-sm text-muted-foreground">Total Funding Raised</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <Users className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2" />
              <p className="text-2xl font-bold">12,487</p>
              <p className="text-sm text-muted-foreground">Total Investors</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
              <p className="text-2xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground">Milestone Success Rate</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <Activity className="w-8 h-8 text-[#8b5cf6] mx-auto mb-2" />
              <p className="text-2xl font-bold">₹35Cr</p>
              <p className="text-sm text-muted-foreground">Escrow Released</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
