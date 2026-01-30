import { Schema, model, type InferSchemaType } from "mongoose";

export const milestoneProofSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    fileName: { type: String, required: true },
    sizeBytes: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
    previewUrl: { type: String },
  },
  { _id: false }
);

export const milestoneSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    date: { type: String },
    escrowRelease: { type: Number, min: 0, max: 100 },
    notes: { type: String },
    proofStatus: {
      type: String,
      enum: ["not-submitted", "submitted", "approved", "rejected"],
      default: "not-submitted",
    },
    proofUploads: { type: [milestoneProofSchema], default: [] },
    lastProofAt: { type: String },
    proofNotes: { type: String },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    fundingTarget: { type: Number, required: true },
    fundingRaised: { type: Number, default: 0 },
    roi: { type: Number, required: true },
    tenure: { type: Number, required: true },
    tokenPrice: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    status: { type: String, enum: ["active", "completed", "pending"], default: "pending" },
    issuer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuerName: { type: String, required: true },
    issuerVerified: { type: Boolean, default: false },
    image: { type: String },
    milestones: { type: [milestoneSchema], default: [] },
  },
  { timestamps: true }
);

projectSchema.index({ name: "text", category: "text", location: "text" });
projectSchema.index({ issuer: 1 });

export type MilestoneDocument = InferSchemaType<typeof milestoneSchema>;
export type ProjectDocument = InferSchemaType<typeof projectSchema> & { _id: Schema.Types.ObjectId };

export const ProjectModel = model("Project", projectSchema);
