import { useState } from "react";
import { Upload, CheckCircle, Clock, Lock, FileText, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { MilestoneStepper } from "@/app/components/MilestoneStepper";
import { mockProjects } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface MilestoneManagementPageProps {
  onNavigate: (page: string) => void;
}

export function MilestoneManagementPage({ onNavigate }: MilestoneManagementPageProps) {
  const [selectedProject] = useState(mockProjects[0]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const handleUploadProof = (milestoneId: string) => {
    setSelectedMilestone(milestoneId);
    setShowUploadModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Milestone Management</h1>
        <p className="text-muted-foreground">
          Track and manage project milestones, upload proofs, and request escrow releases
        </p>
      </div>

      {/* Project Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">{selectedProject.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedProject.location}</p>
            </div>
            <select className="px-4 py-2 border rounded-md bg-input-background">
              <option>Mumbai-Pune Expressway Expansion</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Milestone Timeline */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Milestones Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <MilestoneStepper milestones={selectedProject.milestones} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#10b981]/10 rounded-lg text-center">
                  <CheckCircle className="w-6 h-6 text-[#10b981] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#10b981]">2</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="p-3 bg-[#0ea5e9]/10 rounded-lg text-center">
                  <Clock className="w-6 h-6 text-[#0ea5e9] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0ea5e9]">1</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Released</span>
                  <span className="font-medium text-[#10b981]">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Pending</span>
                  <span className="font-medium text-[#f59e0b]">65%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-accent rounded-lg mb-4">
                <h4 className="font-medium mb-2">Milestone 3: 25% Construction</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Due: May 30, 2026
                </p>
                <Button
                  className="w-full"
                  onClick={() => handleUploadProof(selectedProject.milestones[2].id)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Proof
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload construction photos, audit reports, or invoices as proof
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Milestone Details & Proof History */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Proof History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedProject.milestones
              .filter((m) => m.status === "completed")
              .map((milestone) => (
                <div key={milestone.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{milestone.name}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.date}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981]">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified & Released</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 border rounded-lg flex items-center gap-3">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Approval Document</p>
                        <p className="text-xs text-muted-foreground">2.4 MB • PDF</p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg flex items-center gap-3">
                      <Image className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Site Photos</p>
                        <p className="text-xs text-muted-foreground">12.6 MB • JPG</p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg flex items-center gap-3">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Audit Report</p>
                        <p className="text-xs text-muted-foreground">3.1 MB • PDF</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-[#10b981]/10 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Escrow Released</span>
                      <span className="font-medium text-[#10b981]">
                        ₹{((selectedProject.fundingRaised * (milestone.escrowRelease || 0)) / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Milestone Proof</CardTitle>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-accent rounded-full"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  Milestone: {selectedProject.milestones.find((m) => m.id === selectedMilestone)?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Upload proof documents to verify completion and request escrow release
                </p>
              </div>

              <div className="space-y-4">
                {["Construction Photos", "Audit/Inspection Report", "Invoice/Payment Proof"].map(
                  (doc, i) => (
                    <div key={i} className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="font-medium mb-1">{doc}</p>
                      <p className="text-xs text-muted-foreground mb-3">PDF, JPG, PNG (Max 20MB)</p>
                      <Button size="sm" variant="outline">
                        Choose Files
                      </Button>
                    </div>
                  )
                )}
              </div>

              <div className="p-4 bg-accent rounded-lg">
                <h4 className="font-medium mb-2">Escrow Release Details</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount to be released</span>
                  <span className="text-lg font-semibold text-[#10b981]">
                    ₹
                    {(
                      (selectedProject.fundingRaised *
                        (selectedProject.milestones.find((m) => m.id === selectedMilestone)
                          ?.escrowRelease || 0)) /
                      100
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowUploadModal(false);
                    // Submit proof logic
                  }}
                >
                  Submit for Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
