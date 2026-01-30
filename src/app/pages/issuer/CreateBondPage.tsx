import { useMemo, useState } from "react";
import { ArrowLeft, Upload, Eye, CheckCircle, Plus, Trash2, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePlatformData,
  type SubmissionDocument,
  type ProjectSubmission,
  type ProjectSubmissionInput,
} from "@/contexts/InvestorDataContext";
import type { Milestone } from "@/app/components/MilestoneStepper";

interface CreateBondPageProps {
  onNavigate: (page: string) => void;
}

interface MilestoneFormValue {
  id: string;
  name: string;
  escrowRelease: string;
  dueDate: string;
}

const REQUIRED_DOCUMENTS = [
  "Tender Approval Document",
  "Environmental Clearance Certificate",
  "Project DPR (Detailed Project Report)",
  "Financial Projections",
  "Issuer Registration Certificate",
];

const createDocumentState = (): SubmissionDocument[] =>
  REQUIRED_DOCUMENTS.map((label, index) => ({
    id: `doc-${index + 1}`,
    label,
    uploaded: false,
  }));

const createMilestoneState = (): MilestoneFormValue[] =>
  Array.from({ length: 3 }, (_, index) => ({
    id: `milestone-${index + 1}`,
    name: "",
    escrowRelease: "",
    dueDate: "",
  }));

export function CreateBondPage({ onNavigate }: CreateBondPageProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: "",
    category: "roads",
    location: "",
    description: "",
    fundingGoal: "",
    roi: "",
    tenure: "",
    tokenPrice: "100",
  });
  const [milestones, setMilestones] = useState<MilestoneFormValue[]>(createMilestoneState());
  const [documents, setDocuments] = useState<SubmissionDocument[]>(createDocumentState());
  const [statusMessage, setStatusMessage] = useState<{ variant: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { data, submitProject } = usePlatformData();

  const issuerSubmissions = useMemo(() => {
    if (!user?.id) {
      return [];
    }
    return (data.projectSubmissions ?? []).filter((submission) => submission.issuerId === user.id);
  }, [data.projectSubmissions, user?.id]);

  const approvedProjects = useMemo(() => {
    if (!user?.id) {
      return [];
    }
    return (data.projects ?? []).filter((project) => project.issuerId === user.id);
  }, [data.projects, user?.id]);

  const totalEscrow = useMemo(
    () =>
      milestones.reduce((sum, milestone) => {
        const percent = Number(milestone.escrowRelease);
        return Number.isNaN(percent) ? sum : sum + percent;
      }, 0),
    [milestones]
  );

  const summaryCards = [
    { label: "Submitted", value: issuerSubmissions.length },
    { label: "Pending", value: issuerSubmissions.filter((submission) => submission.status === "pending").length },
    { label: "Approved", value: issuerSubmissions.filter((submission) => submission.status === "approved").length },
    { label: "Live on Marketplace", value: approvedProjects.length },
  ];

  const formSteps = [
    { num: 1, label: "Project Details" },
    { num: 2, label: "Financial Terms" },
    { num: 3, label: "Milestones" },
    { num: 4, label: "Documents" },
    { num: 5, label: "Preview & Submit" },
  ];

  const handleDocumentUpload = (docId: string, file: File | null) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) {
          return doc;
        }
        if (!file) {
          return { ...doc, uploaded: false, fileName: undefined, previewUrl: undefined, sizeBytes: undefined };
        }
        const previewUrl = URL.createObjectURL(file);
        return {
          ...doc,
          uploaded: true,
          fileName: file.name,
          previewUrl,
          sizeBytes: file.size,
        };
      })
    );
  };

  const triggerDocumentSelect = (docId: string) => {
    if (typeof document === "undefined") {
      return;
    }
    const input = document.getElementById(`upload-${docId}`) as HTMLInputElement | null;
    input?.click();
  };

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        id: `milestone-${prev.length + 1}`,
        name: "",
        escrowRelease: "",
        dueDate: "",
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => (prev.length === 1 ? prev : prev.filter((milestone) => milestone.id !== id)));
  };

  const updateMilestone = (id: string, field: keyof MilestoneFormValue, value: string) => {
    setMilestones((prev) => prev.map((milestone) => (milestone.id === id ? { ...milestone, [field]: value } : milestone)));
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      category: "roads",
      location: "",
      description: "",
      fundingGoal: "",
      roi: "",
      tenure: "",
      tokenPrice: "100",
    });
    setMilestones(createMilestoneState());
    setDocuments(createDocumentState());
    setStep(1);
  };

  const mapMilestonesToPayload = (): Milestone[] =>
    milestones
      .filter((milestone) => milestone.name.trim())
      .map((milestone, index) => ({
        id: milestone.id || `milestone-${index + 1}`,
        name: milestone.name.trim(),
        status: "pending" as const,
        date: milestone.dueDate || undefined,
        escrowRelease: milestone.escrowRelease ? Number(milestone.escrowRelease) : undefined,
      }));

  const handleSubmit = () => {
    if (isSubmitting) {
      return;
    }

    if (!user?.id) {
      setStatusMessage({ variant: "error", message: "You must be logged in as an issuer to submit a project." });
      return;
    }

    const requiredFields = [
      formData.projectName,
      formData.location,
      formData.description,
      formData.fundingGoal,
      formData.roi,
      formData.tenure,
      formData.tokenPrice,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      setStatusMessage({ variant: "error", message: "Please complete all required fields before submitting." });
      return;
    }

    if (Math.round(totalEscrow) !== 100) {
      setStatusMessage({ variant: "error", message: "Escrow allocation must equal 100%." });
      return;
    }

    const milestonePayload = mapMilestonesToPayload();
    if (milestonePayload.length === 0) {
      setStatusMessage({ variant: "error", message: "Add at least one milestone to describe project execution." });
      return;
    }

    const payload: ProjectSubmissionInput = {
      name: formData.projectName.trim(),
      category: formData.category,
      location: formData.location.trim(),
      description: formData.description.trim(),
      fundingTarget: Number(formData.fundingGoal),
      roi: Number(formData.roi),
      tenure: Number(formData.tenure),
      tokenPrice: Number(formData.tokenPrice),
      milestones: milestonePayload,
      documents,
      issuerId: user.id,
      issuerName: user.name,
    };

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      submitProject(payload);
      setStatusMessage({ variant: "success", message: "Project submitted for admin review. Track the status below." });
      resetForm();
    } catch (error) {
      setStatusMessage({ variant: "error", message: "Unable to submit project. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => onNavigate("issuer-dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create New Bond Listing</h1>
        <p className="text-muted-foreground">
          List your infrastructure project, submit documentation for admin review, and go live for investors once approved.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4">
        {formSteps.map((stepConfig, index) => (
          <div key={stepConfig.num} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepConfig.num ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > stepConfig.num ? <CheckCircle className="w-5 h-5" /> : stepConfig.num}
              </div>
              <span className="text-sm font-medium hidden md:block">{stepConfig.label}</span>
            </div>
            {index < formSteps.length - 1 && (
              <div className={`h-0.5 w-full mx-2 ${step > stepConfig.num ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {statusMessage && (
        <Alert variant={statusMessage.variant === "success" ? "default" : "destructive"}>
          <AlertDescription>{statusMessage.message}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Project Details"}
              {step === 2 && "Financial Terms"}
              {step === 3 && "Define Milestones"}
              {step === 4 && "Upload Documents"}
              {step === 5 && "Preview & Submit"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block">Project Name</label>
                  <Input
                    value={formData.projectName}
                    onChange={(event) => setFormData({ ...formData, projectName: event.target.value })}
                    placeholder="e.g., Mumbai Metro Line Extension"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-input-background"
                    >
                      <option value="roads">Roads & Highways</option>
                      <option value="transport">Public Transport</option>
                      <option value="energy">Renewable Energy</option>
                      <option value="smart-cities">Smart Cities</option>
                      <option value="ports">Ports & Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                      placeholder="State, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm mb-2 block">Project Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    placeholder="Describe the project, its impact, and benefits..."
                    rows={5}
                    className="w-full px-3 py-2 border rounded-md bg-input-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Include SDG alignment, expected impact, and key features.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block">Funding Goal (₹)</label>
                  <Input
                    type="number"
                    value={formData.fundingGoal}
                    onChange={(event) => setFormData({ ...formData, fundingGoal: event.target.value })}
                    placeholder="50000000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total funding required</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm mb-2 block">ROI (% per annum)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.roi}
                      onChange={(event) => setFormData({ ...formData, roi: event.target.value })}
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Tenure (years)</label>
                    <Input
                      type="number"
                      value={formData.tenure}
                      onChange={(event) => setFormData({ ...formData, tenure: event.target.value })}
                      placeholder="7"
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Token Price (₹)</label>
                    <Input
                      type="number"
                      value={formData.tokenPrice}
                      onChange={(event) => setFormData({ ...formData, tokenPrice: event.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Tokens:</span>
                      <p className="font-medium">
                        {formData.fundingGoal && formData.tokenPrice
                          ? (Number(formData.fundingGoal) / Number(formData.tokenPrice)).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected Return:</span>
                      <p className="font-medium">
                        {formData.roi && formData.tenure && formData.fundingGoal
                          ? `₹${(
                              Number(formData.fundingGoal) *
                              Math.pow(
                                1 + Number(formData.roi) / 100,
                                Number(formData.tenure)
                              )
                            ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Define milestones with escrow release percentages. Total must equal 100%.</p>
                  <Button variant="outline" size="sm" onClick={addMilestone}>
                    <Plus className="w-4 h-4 mr-2" /> Add Milestone
                  </Button>
                </div>

                {milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Milestone</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeMilestone(milestone.id)} disabled={milestones.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm mb-2 block">Milestone Name</label>
                        <Input
                          value={milestone.name}
                          onChange={(event) => updateMilestone(milestone.id, "name", event.target.value)}
                          placeholder="e.g., Tender Approval"
                        />
                      </div>
                      <div>
                        <label className="text-sm mb-2 block">Escrow Release (%)</label>
                        <Input
                          type="number"
                          value={milestone.escrowRelease}
                          onChange={(event) => updateMilestone(milestone.id, "escrowRelease", event.target.value)}
                          placeholder="20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm mb-2 block">Target Date</label>
                      <Input
                        type="date"
                        value={milestone.dueDate}
                        onChange={(event) => updateMilestone(milestone.id, "dueDate", event.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <div className={`p-3 rounded-lg text-sm ${Math.round(totalEscrow) === 100 ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#f97316]/10 text-[#f97316]"}`}>
                  <strong>Total Escrow Allocation:</strong> {totalEscrow}%
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Upload required documents for verification</p>

                {documents.map((doc) => (
                  <div key={doc.id} className="border-2 border-dashed rounded-lg p-6 text-center space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 10MB)</p>
                    <input
                      id={`upload-${doc.id}`}
                      type="file"
                      accept="application/pdf,image/png,image/jpeg"
                      className="hidden"
                      onChange={(event) => handleDocumentUpload(doc.id, event.target.files?.[0] ?? null)}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => triggerDocumentSelect(doc.id)}>
                      Choose File
                    </Button>
                    {doc.uploaded && (
                      <div className="text-xs text-[#10b981] flex flex-col gap-1 items-center justify-center">
                        <p className="flex items-center gap-1">
                          <FileCheck className="w-4 h-4" /> {doc.fileName ?? "Uploaded"}
                        </p>
                        {typeof doc.sizeBytes === "number" && (
                          <span className="text-muted-foreground text-[10px]">
                            {(doc.sizeBytes / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="p-6 bg-accent rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">{formData.projectName || "Your Project Name"}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{formData.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{formData.location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Funding Goal</p>
                      <p className="font-medium">₹{formData.fundingGoal ? Number(formData.fundingGoal).toLocaleString("en-IN") : "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-medium">{formData.roi || "—"}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tenure</p>
                      <p className="font-medium">{formData.tenure || "—"} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Token Price</p>
                      <p className="font-medium">₹{formData.tokenPrice || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Milestone Plan</h4>
                  <div className="space-y-2 text-sm">
                    {milestones.map((milestone, index) => (
                      <div key={`${milestone.id}-${index}`} className="flex items-center justify-between">
                        <span>{milestone.name || `Milestone ${index + 1}`}</span>
                        <span className="text-muted-foreground">{milestone.escrowRelease || 0}% escrow</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#0ea5e9]/10 rounded-lg text-sm">
                  <p className="text-foreground">
                    <strong>Important:</strong> Your bond listing will be submitted to platform admin for verification. You will be notified once it's approved and goes live.
                  </p>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit for Admin Approval"}
                </Button>
              </div>
            )}

            {step < 5 && (
              <div className="flex gap-4 mt-6">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                    Previous
                  </Button>
                )}
                <Button onClick={() => setStep(step + 1)} className="flex-1">
                  {step === 4 ? "Preview" : "Continue"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
          </CardHeader>
          <CardContent>
            {issuerSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Submissions you create will appear here with their current review status.
              </p>
            ) : (
              <div className="space-y-3">
                {issuerSubmissions.map((submission: ProjectSubmission) => (
                  <div key={submission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{submission.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          submission.status === "approved"
                            ? "default"
                            : submission.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {submission.status}
                      </Badge>
                    </div>
                    {submission.status === "rejected" && submission.rejectionReason && (
                      <p className="text-xs text-red-600">Reason: {submission.rejectionReason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
