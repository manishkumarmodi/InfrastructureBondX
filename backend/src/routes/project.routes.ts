import { Router } from "express";
import {
	addMilestone,
	createProject,
	getProject,
	listProjects,
	submitMilestoneProofController,
	reviewMilestoneProofController,
	updateMilestone,
	updateProject,
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", listProjects);
router.get("/:projectId", getProject);
router.post("/", requireAuth(["issuer", "admin"]), createProject);
router.patch("/:projectId", requireAuth(["issuer", "admin"]), updateProject);
router.post("/:projectId/milestones", requireAuth(["issuer", "admin"]), addMilestone);
router.patch("/:projectId/milestones/:milestoneId", requireAuth(["issuer", "admin"]), updateMilestone);
router.post(
	"/:projectId/milestones/:milestoneId/proofs",
	requireAuth(["issuer", "admin"]),
	submitMilestoneProofController
);
router.post(
	"/:projectId/milestones/:milestoneId/review",
	requireAuth(["admin"]),
	reviewMilestoneProofController
);

export default router;
