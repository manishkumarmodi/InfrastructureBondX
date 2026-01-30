import { DollarSign, Users, Briefcase, TrendingUp, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface IssuerDashboardProps {
  onNavigate: (page: string) => void;
}

export function IssuerDashboard({ onNavigate }: IssuerDashboardProps) {
  const fundingTrend = [
    { month: "Aug", amount: 0 },
    { month: "Sep", amount: 5000000 },
    { month: "Oct", amount: 12000000 },
    { month: "Nov", amount: 22000000 },
    { month: "Dec", amount: 35000000 },
    { month: "Jan", amount: 50000000 },
  ];

  const investorDemographics = [
    { name: "Retail", value: 65, color: "#0ea5e9" },
    { name: "Institutional", value: 25, color: "#8b5cf6" },
    { name: "HNI", value: 10, color: "#10b981" },
  ];

  const upcomingMilestones = [
    {
      id: "1",
      project: "Mumbai-Pune Expressway",
      milestone: "25% Construction Completion",
      dueDate: "May 30, 2026",
      status: "in-progress",
    },
    {
      id: "2",
      project: "Mumbai-Pune Expressway",
      milestone: "50% Construction & Audit",
      dueDate: "Aug 15, 2026",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Issuer Dashboard</h1>
          <p className="text-muted-foreground">
            Maharashtra State Road Development Corporation
          </p>
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
          value="₹50Cr"
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Users}
          label="Total Investors"
          value="5,237"
          color="text-[#0ea5e9]"
          className="border-l-[#0ea5e9]"
        />
        <ImpactCard
          icon={Briefcase}
          label="Active Projects"
          value="3"
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={TrendingUp}
          label="Avg. Project Progress"
          value="42%"
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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fundingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#0c4a6e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investor Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Investor Demographics</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {investorDemographics.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Milestones */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{milestone.milestone}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.project}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        milestone.status === "in-progress"
                          ? "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {milestone.status === "in-progress" ? "In Progress" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due: {milestone.dueDate}</span>
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
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#10b981] rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Milestone 2 Approved</p>
                  <p className="text-xs text-muted-foreground">
                    Land Acquisition milestone verified • 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#0ea5e9] rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Escrow Released</p>
                  <p className="text-xs text-muted-foreground">
                    ₹10Cr released to project account • 5 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#f59e0b] rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New Investors Joined</p>
                  <p className="text-xs text-muted-foreground">
                    127 new investors in last 24 hours • 1 day ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Funding Target Updated</p>
                  <p className="text-xs text-muted-foreground">
                    Mumbai-Pune Expressway now 77% funded • 2 days ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <tr className="border-b hover:bg-accent">
                  <td className="py-4 px-4">
                    <p className="font-medium">Mumbai-Pune Expressway Expansion</p>
                  </td>
                  <td className="py-4 px-4 text-right">₹50Cr</td>
                  <td className="py-4 px-4 text-right font-medium">₹38.5Cr</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-[#10b981]">77%</span>
                  </td>
                  <td className="py-4 px-4 text-right">3,850</td>
                  <td className="py-4 px-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => onNavigate("milestones")}>
                      Manage
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
