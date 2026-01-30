import { Wallet, TrendingUp, Target, Bell, Activity, Building2, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ImpactCard } from "@/app/components/ImpactCard";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface InvestorDashboardProps {
  onNavigate: (page: string) => void;
}

export function InvestorDashboard({ onNavigate }: InvestorDashboardProps) {
  const portfolioData = [
    { month: "Aug", value: 0 },
    { month: "Sep", value: 2000 },
    { month: "Oct", value: 3500 },
    { month: "Nov", value: 5200 },
    { month: "Dec", value: 7800 },
    { month: "Jan", value: 10000 },
  ];

  const riskDistribution = [
    { name: "Low Risk", value: 5000, color: "#10b981" },
    { name: "Medium Risk", value: 3000, color: "#f59e0b" },
    { name: "High Risk", value: 2000, color: "#dc2626" },
  ];

  const notifications = [
    {
      id: "1",
      type: "success",
      title: "Milestone Completed",
      message: "Mumbai-Pune Expressway: 25% construction milestone verified",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "info",
      title: "Escrow Released",
      message: "₹1,250 released to Gujarat Solar Power Plant",
      time: "5 hours ago",
    },
    {
      id: "3",
      type: "warning",
      title: "Risk Score Changed",
      message: "Delhi Water Management: Risk increased to 45/100",
      time: "1 day ago",
    },
  ];

  const recommendedProjects = [
    {
      id: "proj-005",
      name: "Chennai Port Modernization",
      roi: 8.0,
      risk: 28,
      progress: 69,
    },
    {
      id: "proj-006",
      name: "Hyderabad Outer Ring Road Phase 2",
      roi: 7.5,
      risk: 35,
      progress: 30,
    },
  ];

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
          value="₹10,000"
          color="text-primary"
          className="border-l-primary"
        />
        <ImpactCard
          icon={Coins}
          label="Tokens Owned"
          value="100"
          color="text-[#0ea5e9]"
          className="border-l-[#0ea5e9]"
        />
        <ImpactCard
          icon={TrendingUp}
          label="Expected Returns"
          value="₹11,850"
          color="text-[#10b981]"
          className="border-l-[#10b981]"
        />
        <ImpactCard
          icon={Target}
          label="Avg. ROI"
          value="8.2%"
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
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c4a6e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0c4a6e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
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
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-2xl font-bold text-primary mb-1">Your investment helped build:</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#10b981]">127m</p>
                <p className="text-sm text-muted-foreground">Road Length</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#0ea5e9]">3.2%</p>
                <p className="text-sm text-muted-foreground">Solar Capacity</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#f59e0b]">42</p>
                <p className="text-sm text-muted-foreground">Jobs Enabled</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-[#8b5cf6]">8.5T</p>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              </div>
            </div>
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
            {notifications.map((notif) => (
              <div key={notif.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">{notif.title}</h4>
                  <span className="text-xs text-muted-foreground">{notif.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
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
            {recommendedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                onClick={() => onNavigate(`project-${project.id}`)}
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{project.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>ROI: {project.roi}%</span>
                    <span>Risk: {project.risk}/100</span>
                    <span>Progress: {project.progress}%</span>
                  </div>
                </div>
                <Button>View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
