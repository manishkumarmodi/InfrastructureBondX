import { Milestone } from "@/app/components/MilestoneStepper";

export type ProjectStatus = "active" | "completed" | "pending";

export interface Project {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  fundingTarget: number;
  fundingRaised: number;
  roi: number;
  tenure: number;
  tokenPrice: number;
  riskScore: number;
  issuerId: string;
  issuerName: string;
  issuerVerified: boolean;
  milestones: Milestone[];
  status: ProjectStatus;
  image?: string;
}
