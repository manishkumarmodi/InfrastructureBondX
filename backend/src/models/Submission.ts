import { Schema, model, type InferSchemaType } from "mongoose";
import { milestoneSchema } from "./Project";

const submissionDocumentSchema = new Schema(
  {
    id: { type: String },
    label: { type: String, required: true },
    uploaded: { type: Boolean, default: false },
    fileName: { type: String },
    sizeBytes: { type: Number },
    previewUrl: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSubmissionSchema = new Schema(
  {
    issuer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuerName: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    fundingTarget: { type: Number, required: true },
    roi: { type: Number, required: true },
    tenure: { type: Number, required: true },
    tokenPrice: { type: Number, required: true },
    milestones: { type: [milestoneSchema], default: [] },
    documents: { type: [submissionDocumentSchema], default: [] },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: { createdAt: "submittedAt", updatedAt: true } }
);

projectSubmissionSchema.index({ issuer: 1 });

export type ProjectSubmissionDocument = InferSchemaType<typeof projectSubmissionSchema> & { _id: Schema.Types.ObjectId };

export const ProjectSubmissionModel = model("ProjectSubmission", projectSubmissionSchema);
