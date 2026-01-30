import { useEffect, useMemo, useState } from "react";
import { ClipboardList, CheckCircle2, XCircle, MapPin, IndianRupee, Target, Clock, FileCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { MilestoneStepper } from "@/app/components/MilestoneStepper";
import {
  usePlatformData,
  type ProjectSubmission,
  type SubmissionStatus,
} from "@/contexts/InvestorDataContext";

interface ProjectApprovalsPageProps {
  onNavigate: (page: string) => void;
}

const statusFilters: Array<{ id: SubmissionStatus; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export function ProjectApprovalsPage({ onNavigate }: ProjectApprovalsPageProps) {
  const { data, approveProject, rejectProject } = usePlatformData();
  const submissions = data.projectSubmissions ?? [];
  const projects = data.projects ?? [];
  const [activeStatus, setActiveStatus] = useState<SubmissionStatus>("pending");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const filteredSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === activeStatus),
    [activeStatus, submissions]
  );

  useEffect(() => {
    if (filteredSubmissions.length === 0) {
      setSelectedSubmissionId(null);
      return;
    }
    setSelectedSubmissionId((prev) =>
      filteredSubmissions.some((submission) => submission.id === prev)
        ? prev
        : filteredSubmissions[0].id
    );
  }, [filteredSubmissions]);

  useEffect(() => {
    setRejectionReason("");
    setActionMessage(null);
  }, [selectedSubmissionId, activeStatus]);

  const selectedSubmission = submissions.find((submission) => submission.id === selectedSubmissionId) ?? null;
  const linkedProject = useMemo(() => {
    if (!selectedSubmission) {
      return null;
    }
    return (
      projects.find(
        (project) =>
          project.issuerId === selectedSubmission.issuerId &&
          project.name.toLowerCase() === selectedSubmission.name.toLowerCase()
      ) ?? null
    );
  }, [projects, selectedSubmission]);

  const resolvedMilestones = linkedProject?.milestones ?? selectedSubmission?.milestones ?? [];

  const summaryStats = useMemo(() => {
    const pending = submissions.filter((submission) => submission.status === "pending").length;
    const approved = submissions.filter((submission) => submission.status === "approved").length;
    const rejected = submissions.filter((submission) => submission.status === "rejected").length;
    return {
      total: submissions.length,
      pending,
      approved,
      rejected,
    };
  }, [submissions]);

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—";
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const handleApprove = async () => {
    if (!selectedSubmission || selectedSubmission.status !== "pending") {
      return;
    }
    setIsActionPending(true);
    setActionMessage(null);
    try {
      await approveProject(selectedSubmission.id);
      setActionMessage("Project approved and now visible to investors.");
    } catch (error) {
      console.error("Approval failed", error);
      setActionMessage("Unable to approve the project right now. Try again later.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || selectedSubmission.status !== "pending") {
      return;
    }
    if (!rejectionReason.trim()) {
      setActionMessage("Provide a reason before rejecting a submission.");
      return;
    }
    setIsActionPending(true);
    setActionMessage(null);
    try {
      await rejectProject(selectedSubmission.id, rejectionReason.trim());
      setActionMessage("Submission rejected and issuer notified.");
      setRejectionReason("");
    } catch (error) {
      console.error("Rejection failed", error);
      setActionMessage("Unable to reject the submission right now. Try again later.");
    } finally {
      setIsActionPending(false);
    }
  };

  const getStatusBadgeVariant = (status: SubmissionStatus) => {
    if (status === "approved") return "default" as const;
    if (status === "rejected") return "destructive" as const;
    return "secondary" as const;
  };

  const renderSubmissionList = (items: ProjectSubmission[]) => {
    if (items.length === 0) {
      return <p className="text-sm text-muted-foreground">No submissions in this state.</p>;
    }
    return (
      <div className="space-y-3">
        {items.map((submission) => (
          <button
            key={submission.id}
            onClick={() => setSelectedSubmissionId(submission.id)}
            className={`w-full p-4 border rounded-lg text-left transition-colors ${
              submission.id === selectedSubmissionId ? "border-primary bg-accent" : "hover:border-primary"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium">{submission.name}</p>
              <Badge variant={getStatusBadgeVariant(submission.status)}>{submission.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Submitted {new Date(submission.submittedAt).toLocaleDateString()} • {submission.issuerName}
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {(submission.fundingTarget / 1_00_00_000).toFixed(1)} Cr target
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {submission.roi}% ROI
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {submission.tenure}y tenure
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Approvals</h1>
          <p className="text-muted-foreground">
            Review issuer submissions, verify readiness, and publish projects to the investor marketplace
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate("admin-dashboard")}>
          Back to Admin Overview
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground mb-1">Total Submissions</p>
            <p className="text-2xl font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" /> {summaryStats.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground mb-1">Pending Review</p>
            <p className="text-2xl font-semibold text-[#f59e0b]">{summaryStats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground mb-1">Approved</p>
            <p className="text-2xl font-semibold text-[#10b981]">{summaryStats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground mb-1">Rejected</p>
            <p className="text-2xl font-semibold text-[#dc2626]">{summaryStats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={filter.id === activeStatus ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveStatus(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            {renderSubmissionList(filteredSubmissions)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedSubmission ? (
              <p className="text-sm text-muted-foreground">Select a submission to review detailed information.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedSubmission.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {selectedSubmission.location}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedSubmission.status)}>{selectedSubmission.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Funding Goal</p>
                    <p className="font-medium">{formatCurrency(selectedSubmission.fundingTarget)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Token Price</p>
                    <p className="font-medium">₹{selectedSubmission.tokenPrice.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ROI</p>
                    <p className="font-medium">{selectedSubmission.roi}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tenure</p>
                    <p className="font-medium">{selectedSubmission.tenure} years</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Project Description</p>
                  <p className="text-sm bg-muted p-3 rounded-lg leading-relaxed max-h-32 overflow-auto">
                    {selectedSubmission.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Milestones</h4>
                    {linkedProject && (
                      <span className="text-xs text-muted-foreground">
                        Showing live project status
                      </span>
                    )}
                  </div>
                  <MilestoneStepper milestones={resolvedMilestones} />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Submitted Documents</h4>
                  <div className="space-y-2">
                    {selectedSubmission.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm p-2 rounded-md border ${
                          doc.uploaded ? "border-[#10b981]/30 bg-[#10b981]/5" : "border-dashed"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck className={`w-4 h-4 ${doc.uploaded ? "text-[#10b981]" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium">{doc.label}</p>
                            {doc.fileName && (
                              <p className="text-xs text-muted-foreground">
                                {doc.fileName}
                                {typeof doc.sizeBytes === "number" && ` • ${(doc.sizeBytes / 1024).toFixed(1)} KB`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${doc.uploaded ? "text-[#10b981]" : "text-muted-foreground"}`}>
                            {doc.uploaded ? "Uploaded" : "Missing"}
                          </span>
                          {doc.uploaded && doc.previewUrl && (
                            <Button asChild size="sm" variant="outline">
                              <a href={doc.previewUrl} target="_blank" rel="noreferrer">
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSubmission.status === "pending" && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a rejection reason (required only when rejecting)."
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="success"
                        className="flex-1"
                        onClick={handleApprove}
                        disabled={isActionPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Listing
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleReject}
                        disabled={isActionPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject Submission
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSubmission.status !== "pending" && (
                  <div className="p-3 bg-accent rounded-lg text-sm">
                    {selectedSubmission.status === "approved"
                      ? linkedProject
                        ? "This project is live and reflects current milestone progress."
                        : "This project is live for investors."
                      : `Rejected: ${selectedSubmission.rejectionReason ?? "No reason provided."}`}
                  </div>
                )}

                {actionMessage && (
                  <div className="p-3 bg-[#fef3c7] text-sm rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#f97316]" />
                    <span>{actionMessage}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
