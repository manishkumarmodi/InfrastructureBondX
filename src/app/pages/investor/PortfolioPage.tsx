import { Download, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { mockProjects } from "@/data/mockData";

interface PortfolioPageProps {
  onNavigate: (page: string) => void;
}

export function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const holdings = [
    {
      projectId: "proj-001",
      project: mockProjects[0],
      tokens: 50,
      invested: 5000,
      currentValue: 5425,
      expectedPayout: 6850,
      maturityDate: "Jan 15, 2033",
    },
    {
      projectId: "proj-002",
      project: mockProjects[1],
      tokens: 30,
      invested: 3000,
      currentValue: 3216,
      expectedPayout: 4320,
      maturityDate: "Jan 25, 2036",
    },
    {
      projectId: "proj-003",
      project: mockProjects[2],
      tokens: 20,
      invested: 2000,
      currentValue: 2190,
      expectedPayout: 2950,
      maturityDate: "Nov 5, 2031",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
          <p className="text-muted-foreground">View and manage your infrastructure investments</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹10,000</p>
            <p className="text-xs text-muted-foreground mt-1">Across 3 projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹10,831</p>
            <p className="text-xs text-[#10b981] mt-1">+8.3% growth</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Expected Returns</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-[#10b981]">₹14,120</p>
            <p className="text-xs text-muted-foreground mt-1">At maturity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">100</p>
            <p className="text-xs text-muted-foreground mt-1">InfraTokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map((holding) => (
              <div
                key={holding.projectId}
                className="p-6 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                onClick={() => onNavigate(`project-${holding.projectId}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{holding.project.name}</h3>
                    <p className="text-sm text-muted-foreground">{holding.project.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                    <p className="text-xl font-bold">
                      ₹{holding.currentValue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[#10b981]">
                      +{(((holding.currentValue - holding.invested) / holding.invested) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tokens Owned</p>
                    <p className="font-medium">{holding.tokens}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount Invested</p>
                    <p className="font-medium">₹{holding.invested.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected Payout</p>
                    <p className="font-medium text-[#10b981]">
                      ₹{holding.expectedPayout.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Maturity Date</p>
                    <p className="font-medium">{holding.maturityDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                    <RiskScoreMeter score={holding.project.riskScore} showLabel={false} />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Certificate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate("secondary-market")}>
                    Sell Tokens
                  </Button>
                  <Button size="sm" onClick={() => onNavigate(`project-${holding.projectId}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
