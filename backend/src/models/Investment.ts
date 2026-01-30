import { Schema, model, type InferSchemaType } from "mongoose";

const investmentSchema = new Schema(
  {
    investor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    tokens: { type: Number, required: true },
    amount: { type: Number, required: true },
    txHash: { type: String, required: true, unique: true },
    status: { type: String, enum: ["completed", "pending"], default: "completed" },
    expectedPayout: { type: Number },
    maturityDate: { type: Date },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

investmentSchema.index({ investor: 1 });
investmentSchema.index({ project: 1 });

export type InvestmentDocument = InferSchemaType<typeof investmentSchema> & { _id: Schema.Types.ObjectId };

export const InvestmentModel = model("Investment", investmentSchema);
