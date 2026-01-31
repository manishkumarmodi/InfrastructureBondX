import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Building2, TrendingUp, Clock, Users, FileText, Download, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { VerifiedBadge } from "@/app/components/VerifiedBadge";
import { MilestoneStepper } from "@/app/components/MilestoneStepper";
import { EscrowVisualization } from "@/app/components/EscrowVisualization";
import { ROICalculator } from "@/app/components/ROICalculator";
import { InvestmentModal } from "@/app/components/InvestmentModal";
import { useInvestorData } from "@/contexts/InvestorDataContext";

interface ProjectDetailsPageProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

export function ProjectDetailsPage({ projectId, onNavigate }: ProjectDetailsPageProps) {
  const [showInvestModal, setShowInvestModal] = useState(false);
  const { data } = useInvestorData();
  const sanitizedId = projectId.replace("project-", "");
  const project = useMemo(() => (data.projects ?? []).find((p) => p.id === sanitizedId), [data.projects, sanitizedId]);

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project data unavailable</h2>
        <p className="text-muted-foreground mb-6">Connect your project feed or pick another listing.</p>
        <Button onClick={() => onNavigate("marketplace")}>Back to Marketplace</Button>
      </div>
    );
  }

  const fundingProgress = project.fundingTarget
    ? (project.fundingRaised / project.fundingTarget) * 100
    : 0;
  const totalEscrow = project.fundingRaised;
  const completedEscrowPercent = project.milestones
    .filter((milestone) => milestone.status === "completed")
    .reduce((acc, milestone) => acc + (milestone.escrowRelease ?? 0), 0);
  const releasedEscrow = (totalEscrow * completedEscrowPercent) / 100;
  const lockedEscrow = Math.max(totalEscrow - releasedEscrow, 0);
  const investorCount = project.tokenPrice > 0 ? Math.round(project.fundingRaised / project.tokenPrice) : 0;

  // Calculate riskScore in real time: higher ROI and lower tenure = higher risk, more funding progress = lower risk
  // Example formula: risk = 40 + (roi * 2) - (fundingProgress / 5) + (10 - Math.min(10, tenure))
  let riskScore = 40 + (project.roi * 2) - (fundingProgress / 5) + (10 - Math.min(10, project.tenure));
  riskScore = Math.max(5, Math.min(95, Math.round(riskScore)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => onNavigate("marketplace")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
              </div>
              <span>•</span>
              <span>{project.category}</span>
            </div>
          </div>
          <Button size="lg" onClick={() => setShowInvestModal(true)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Invest Now
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#10b981]">{project.roi}%</p>
            <p className="text-xs text-muted-foreground">ROI per annum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{project.tenure} years</p>
            <p className="text-xs text-muted-foreground">Tenure</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#0ea5e9]">₹{project.tokenPrice}</p>
            <p className="text-xs text-muted-foreground">Token Price</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#8b5cf6]">{fundingProgress.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Funded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#f59e0b]">
              {investorCount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">Investors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Issuer</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{project.issuerName}</span>
                    {project.issuerVerified && <VerifiedBadge size="sm" />}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Investors</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {investorCount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Funding Progress</span>
                  <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${fundingProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">
                    ₹{project.fundingRaised.toLocaleString("en-IN")} raised
                  </span>
                  <span className="font-medium">
                    ₹{project.fundingTarget.toLocaleString("en-IN")} target
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneStepper milestones={project.milestones ?? []} />
            </CardContent>
          </Card>

          {/* Escrow Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Escrow Fund Management</CardTitle>
            </CardHeader>
            <CardContent>
              <EscrowVisualization
                totalFunds={totalEscrow}
                lockedFunds={lockedEscrow}
                releasedFunds={releasedEscrow}
              />
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents & Proofs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload verified approvals, audit reports, and milestone evidence from the issuer
                dashboard to surface them here for investors.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Score */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RiskScoreMeter score={riskScore} />
              <p className="text-sm text-muted-foreground border-t pt-4">
                Store your own diligence checklist, credit ratings, or third-party analytics here to
                explain how this score was derived.
              </p>
            </CardContent>
          </Card>

          {/* ROI Calculator */}
          <ROICalculator
            roiPercentage={project.roi}
            tenure={project.tenure}
            tokenPrice={project.tokenPrice}
          />

          {/* Investment CTA */}
          <Card className="bg-primary text-white">
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="text-xl font-bold">Ready to Invest?</h3>
              <p className="text-sm text-white/90">
                Start building infrastructure with as low as ₹{project.tokenPrice}
              </p>
              <Button
                variant="outline"
                className="w-full bg-white text-primary hover:bg-white/90"
                size="lg"
                onClick={() => setShowInvestModal(true)}
              >
                Invest Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <InvestmentModal
          project={project}
          onClose={() => setShowInvestModal(false)}
          onSuccess={() => {
            setShowInvestModal(false);
            onNavigate("portfolio");
          }}
        />
      )}
    </div>
  );
}
