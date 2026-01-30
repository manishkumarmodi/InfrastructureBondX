import { useMemo } from "react";
import { Download, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { useInvestorData } from "@/contexts/InvestorDataContext";

interface PortfolioPageProps {
  onNavigate: (page: string) => void;
}

export function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const { data } = useInvestorData();
  const holdings = data.holdings ?? [];
  const projects = data.projects ?? [];
  const metrics = data.metrics;

  const projectLookup = useMemo(() => {
    const map = new Map<string, { name: string; location: string; riskScore: number }>();
    projects.forEach((project) => {
      map.set(project.id, {
        name: project.name,
        location: project.location,
        riskScore: project.riskScore,
      });
    });
    return map;
  }, [projects]);

  const resolvedHoldings = useMemo(
    () =>
      holdings.map((holding) => ({
        ...holding,
        project: projectLookup.get(holding.projectId),
      })),
    [holdings, projectLookup]
  );

  const holdingsCount = resolvedHoldings.length;

  const derivedTotals = useMemo(() => {
    const aggregate = holdings.reduce(
      (acc, holding) => {
        acc.invested += holding.invested;
        acc.currentValue += holding.currentValue ?? holding.invested;
        acc.expectedPayout += holding.expectedPayout ?? 0;
        acc.tokens += holding.tokens;
        return acc;
      },
      { invested: 0, currentValue: 0, expectedPayout: 0, tokens: 0 }
    );

    const computedGrowth =
      aggregate.invested > 0
        ? ((aggregate.currentValue - aggregate.invested) / aggregate.invested) * 100
        : undefined;

    return {
      totalInvested: metrics?.totalInvested ?? aggregate.invested,
      currentValue:
        metrics?.totalInvested && typeof metrics.averageRoi === "number"
          ? metrics.totalInvested * (1 + metrics.averageRoi / 100)
          : aggregate.currentValue,
      expectedReturns: metrics?.expectedReturns ?? aggregate.expectedPayout,
      tokens: metrics?.tokensOwned ?? aggregate.tokens,
      growthPercent: metrics?.averageRoi ?? computedGrowth,
    };
  }, [holdings, metrics]);

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

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
            <p className="text-2xl font-bold">{formatCurrency(derivedTotals.totalInvested)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {holdingsCount > 0
                ? `Across ${holdingsCount} project${holdingsCount > 1 ? "s" : ""}`
                : "No active projects"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(derivedTotals.currentValue)}</p>
            <p
              className={`text-xs mt-1 ${
                typeof derivedTotals.growthPercent === "number"
                  ? derivedTotals.growthPercent >= 0
                    ? "text-[#10b981]"
                    : "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {typeof derivedTotals.growthPercent === "number"
                ? `${derivedTotals.growthPercent.toFixed(1)}% growth`
                : "Awaiting performance data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Expected Returns</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-[#10b981]">
              {formatCurrency(derivedTotals.expectedReturns)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">At maturity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {typeof derivedTotals.tokens === "number"
                ? derivedTotals.tokens.toLocaleString("en-IN")
                : "—"}
            </p>
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
            {resolvedHoldings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No holdings yet. Connect your wallet or complete your first investment to see
                positions here.
              </p>
            )}
            {resolvedHoldings.map((holding) => {
              const projectName = holding.project?.name ?? "Unlinked project";
              const projectLocation = holding.project?.location ?? "Location unavailable";
              const currentValue =
                typeof holding.currentValue === "number" ? holding.currentValue : holding.invested;
              const changePercent =
                holding.invested > 0
                  ? ((currentValue - holding.invested) / holding.invested) * 100
                  : undefined;
              const expectedPayout =
                typeof holding.expectedPayout === "number" ? holding.expectedPayout : undefined;

              return (
                <div
                  key={holding.projectId}
                  className="p-6 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                  onClick={() => onNavigate(`project-${holding.projectId}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{projectName}</h3>
                      <p className="text-sm text-muted-foreground">{projectLocation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                      <p className="text-xl font-bold">{formatCurrency(currentValue)}</p>
                      <p
                        className={`text-xs ${
                          typeof changePercent === "number"
                            ? changePercent >= 0
                              ? "text-[#10b981]"
                              : "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {typeof changePercent === "number"
                          ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`
                          : "Awaiting performance"}
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
                      <p className="font-medium">{formatCurrency(holding.invested)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Expected Payout</p>
                      <p className="font-medium text-[#10b981]">
                        {expectedPayout ? formatCurrency(expectedPayout) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Maturity Date</p>
                      <p className="font-medium">{holding.maturityDate ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                      {typeof holding.project?.riskScore === "number" ? (
                        <RiskScoreMeter score={holding.project.riskScore} showLabel={false} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Awaiting rating</span>
                      )}
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
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
