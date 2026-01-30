import { useState } from "react";
import { ArrowLeft, MapPin, Building2, TrendingUp, Clock, Users, FileText, Download, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { VerifiedBadge } from "@/app/components/VerifiedBadge";
import { MilestoneStepper } from "@/app/components/MilestoneStepper";
import { EscrowVisualization } from "@/app/components/EscrowVisualization";
import { ROICalculator } from "@/app/components/ROICalculator";
import { mockProjects } from "@/data/mockData";
import { InvestmentModal } from "@/app/components/InvestmentModal";

interface ProjectDetailsPageProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

export function ProjectDetailsPage({ projectId, onNavigate }: ProjectDetailsPageProps) {
  const [showInvestModal, setShowInvestModal] = useState(false);
  
  // Get project from mock data
  const project = mockProjects.find((p) => p.id === projectId.replace("project-", ""));

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <Button onClick={() => onNavigate("marketplace")}>Back to Marketplace</Button>
      </div>
    );
  }

  const fundingProgress = (project.fundingRaised / project.fundingTarget) * 100;
  const totalEscrow = project.fundingRaised;
  const releasedEscrow = totalEscrow * 0.35; // 35% released based on completed milestones
  const lockedEscrow = totalEscrow - releasedEscrow;

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
              {(project.fundingRaised / project.tokenPrice).toLocaleString()}
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
                      {(project.fundingRaised / project.tokenPrice).toLocaleString()}
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
              <MilestoneStepper milestones={project.milestones} />
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
              <div className="space-y-3">
                {[
                  { name: "Tender Approval Document", date: "Jan 15, 2026", size: "2.4 MB" },
                  { name: "Environmental Clearance", date: "Dec 28, 2025", size: "1.8 MB" },
                  { name: "Milestone 1 Completion Proof", date: "Jan 15, 2026", size: "5.2 MB" },
                  { name: "Milestone 2 Audit Report", date: "Mar 20, 2026", size: "3.1 MB" },
                  { name: "Construction Progress Photos", date: "Jan 28, 2026", size: "12.6 MB" },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
              <RiskScoreMeter score={project.riskScore} />
              <div className="pt-4 border-t space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong>Factors:</strong>
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✓ Issuer verified and credible</li>
                  <li>✓ Clear milestone structure</li>
                  <li>✓ Government-backed project</li>
                  <li>⚠ Subject to regulatory changes</li>
                </ul>
              </div>
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
