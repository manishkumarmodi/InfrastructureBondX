import { useEffect, useMemo, useState } from "react";
import { Upload, CheckCircle, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { MilestoneStepper } from "@/app/components/MilestoneStepper";
import { usePlatformData } from "@/contexts/InvestorDataContext";
import { useAuth } from "@/contexts/AuthContext";

interface MilestoneManagementPageProps {
  onNavigate: (page: string) => void;
}

interface ProofTemplate {
  id: string;
  label: string;
  helper: string;
}

interface ProofDraft {
  templateId: string;
  label: string;
  helper: string;
  file?: File;
}

const PROOF_TEMPLATES: ProofTemplate[] = [
  {
    id: "construction",
    label: "Construction Photos",
    helper: "Upload on-site progress shots or drone footage.",
  },
  {
    id: "audit",
    label: "Audit / Inspection Report",
    helper: "Attach third-party inspection PDFs or reports.",
  },
  {
    id: "invoice",
    label: "Invoice / Payment Proof",
    helper: "Share vendor invoices or bank payment receipts.",
  },
];

const buildInitialProofDrafts = (): Record<string, ProofDraft> =>
  PROOF_TEMPLATES.reduce<Record<string, ProofDraft>>((acc, template) => {
    acc[template.id] = { ...template };
    return acc;
  }, {});

export function MilestoneManagementPage({ onNavigate }: MilestoneManagementPageProps) {
  const { data, submitMilestoneProof } = usePlatformData();
  const { user } = useAuth();
  const issuerProjects = useMemo(() => {
    if (!user?.id) {
      return [];
    }
    return (data.projects ?? []).filter((project) => project.issuerId === user.id);
  }, [data.projects, user?.id]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [proofDrafts, setProofDrafts] = useState<Record<string, ProofDraft>>(() => buildInitialProofDrafts());
  const [proofNotes, setProofNotes] = useState("");
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [proofSubmitting, setProofSubmitting] = useState(false);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  useEffect(() => {
    if (issuerProjects.length === 0) {
      setSelectedProjectId("");
      return;
    }
    setSelectedProjectId((prev) => (issuerProjects.some((project) => project.id === prev) ? prev : issuerProjects[0].id));
  }, [issuerProjects]);

  useEffect(() => {
    setActionBanner(null);
  }, [selectedProjectId]);

  const selectedProject = useMemo(
    () => issuerProjects.find((project) => project.id === selectedProjectId),
    [issuerProjects, selectedProjectId]
  );

  const selectedMilestoneDetails = useMemo(() => {
    if (!selectedMilestone || !selectedProject) {
      return null;
    }
    return selectedProject.milestones?.find((milestone) => milestone.id === selectedMilestone) ?? null;
  }, [selectedMilestone, selectedProject]);

  const handleUploadProof = (milestoneId: string) => {
    setSelectedMilestone(milestoneId);
    setProofDrafts(buildInitialProofDrafts());
    setProofNotes("");
    setUploadFeedback(null);
    setShowUploadModal(true);
  };

  const handleProofFileChange = (templateId: string, file: File | null) => {
    setProofDrafts((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        file: file ?? undefined,
      },
    }));
  };

  const handleSubmitProof = () => {
    if (!selectedProject || !selectedMilestone) {
      setUploadFeedback("Select a milestone to continue.");
      return;
    }

    const preparedFiles = Object.values(proofDrafts).filter((draft) => draft.file);
    if (preparedFiles.length === 0) {
      setUploadFeedback("Attach at least one proof file.");
      return;
    }

    setProofSubmitting(true);
    submitMilestoneProof({
      projectId: selectedProject.id,
      milestoneId: selectedMilestone,
      files: preparedFiles.map((draft) => ({ label: draft.label, file: draft.file! })),
      notes: proofNotes.trim() || undefined,
    });
    setProofSubmitting(false);
    setProofDrafts(buildInitialProofDrafts());
    setProofNotes("");
    setShowUploadModal(false);
    setActionBanner("Proof submitted. Awaiting admin verification.");
  };

  const milestoneStats = useMemo(() => {
    if (!selectedProject?.milestones) {
      return { completed: 0, inProgress: 0, releasedPercent: 0 };
    }
    const completed = selectedProject.milestones.filter((m) => m.status === "completed").length;
    const inProgress = selectedProject.milestones.filter((m) => m.status === "in-progress").length;
    const releasedPercent = selectedProject.milestones
      .filter((m) => m.status === "completed")
      .reduce((acc, milestone) => acc + (milestone.escrowRelease ?? 0), 0);
    return {
      completed,
      inProgress,
      releasedPercent,
    };
  }, [selectedProject]);

  const nextMilestone = useMemo(() => {
    return selectedProject?.milestones?.find((milestone) => milestone.status !== "completed");
  }, [selectedProject]);

  const milestonesWithProofs = useMemo(() => {
    return (selectedProject?.milestones ?? []).filter((milestone) => (milestone.proofUploads?.length ?? 0) > 0);
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Milestone Management</h1>
          <p className="text-muted-foreground">
            Add a project to the platform to start tracking milestone evidence and escrow releases.
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No project selected. Create a listing or sync your portfolio to manage milestones here.
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <select
              className="px-4 py-2 border rounded-md bg-input-background"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              {issuerProjects.map((project) => (
                <option value={project.id} key={project.id}>
                  {project.name}
                </option>
              ))}
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
            <MilestoneStepper milestones={selectedProject.milestones ?? []} />
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
                  <p className="text-2xl font-bold text-[#10b981]">{milestoneStats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="p-3 bg-[#0ea5e9]/10 rounded-lg text-center">
                  <Clock className="w-6 h-6 text-[#0ea5e9] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0ea5e9]">{milestoneStats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Released</span>
                  <span className="font-medium text-[#10b981]">
                    {milestoneStats.releasedPercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Pending</span>
                  <span className="font-medium text-[#f59e0b]">
                    {Math.max(100 - milestoneStats.releasedPercent, 0)}%
                  </span>
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
                {nextMilestone ? (
                  <>
                    <h4 className="font-medium mb-2">{nextMilestone.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Due: {nextMilestone.date ?? "TBD"}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => handleUploadProof(nextMilestone.id)}
                      disabled={nextMilestone.proofStatus === "submitted"}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {nextMilestone.proofStatus === "submitted" ? "Awaiting Review" : "Upload Proof"}
                    </Button>
                    {nextMilestone.proofStatus === "submitted" && (
                      <p className="text-xs text-[#f59e0b] mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Documents sent for admin verification
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    All milestones are verified. Create a new milestone to continue tracking.
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload construction photos, audit reports, or invoices as proof
              </p>
              {actionBanner && (
                <p className="text-xs text-[#10b981] mt-2">{actionBanner}</p>
              )}
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
            {milestonesWithProofs.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">
                No proof uploads yet. Submit evidence from the Next Action panel.
              </div>
            )}
            {milestonesWithProofs.map((milestone) => (
              <div key={milestone.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{milestone.name}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.date ?? "Schedule pending"}</p>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${
                      milestone.proofStatus === "approved"
                        ? "bg-[#10b981]/10 text-[#10b981]"
                        : "bg-[#f59e0b]/10 text-[#f59e0b]"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {milestone.proofStatus === "approved" ? "Verified" : "Awaiting Review"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(milestone.proofUploads ?? []).map((proof) => (
                    <div key={proof.id} className="p-3 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{proof.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {proof.fileName}
                            {proof.sizeBytes && ` • ${(proof.sizeBytes / 1024).toFixed(1)} KB`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(proof.uploadedAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      {proof.previewUrl && (
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={proof.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={`${milestone.name}-${proof.fileName}`}
                          >
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#10b981]/10 rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Escrow Released</span>
                    <span className="font-medium text-[#10b981]">
                      ₹{((selectedProject.fundingRaised * (milestone.escrowRelease || 0)) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {milestone.proofNotes && (
                    <p className="text-xs text-muted-foreground mt-2">Notes: {milestone.proofNotes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
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
            <CardContent className="space-y-4 overflow-y-auto pr-2 max-h-[70vh]">
              <div>
                <h4 className="font-medium mb-2">
                  Milestone: {selectedMilestoneDetails?.name ?? "Select a milestone"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Upload proof documents to verify completion and request escrow release
                </p>
              </div>

              <div className="space-y-4">
                {PROOF_TEMPLATES.map((template) => {
                  const draft = proofDrafts[template.id];
                  const inputId = `proof-${template.id}`;
                  return (
                    <div key={template.id} className="border-2 border-dashed rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{template.label}</p>
                          <p className="text-xs text-muted-foreground">{template.helper}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">PDF, JPG, PNG (Max 20MB)</p>
                      <input
                        id={inputId}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(event) => handleProofFileChange(template.id, event.target.files?.[0] ?? null)}
                      />
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <Button asChild size="sm" variant="outline">
                          <label htmlFor={inputId} className="cursor-pointer">
                            {draft?.file ? "Replace File" : "Choose File"}
                          </label>
                        </Button>
                        {draft?.file && (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>
                              {draft.file.name} • {(draft.file.size / 1024).toFixed(1)} KB
                            </span>
                            <button
                              type="button"
                              className="text-[#dc2626]"
                              onClick={() => handleProofFileChange(template.id, null)}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Reviewer Notes (optional)</p>
                <Textarea
                  placeholder="Add context for the verifier (e.g. inspection reference #, weather delays, etc.)"
                  value={proofNotes}
                  onChange={(event) => setProofNotes(event.target.value)}
                  rows={3}
                />
              </div>

              <div className="p-4 bg-accent rounded-lg">
                <h4 className="font-medium mb-2">Escrow Release Details</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount to be released</span>
                  <span className="text-lg font-semibold text-[#10b981]">
                    ₹
                    {(
                      ((selectedProject?.fundingRaised ?? 0) * (selectedMilestoneDetails?.escrowRelease ?? 0)) /
                      100
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {uploadFeedback && <p className="text-xs text-[#dc2626]">{uploadFeedback}</p>}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSubmitProof} disabled={proofSubmitting}>
                  {proofSubmitting ? "Submitting..." : "Submit for Verification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
