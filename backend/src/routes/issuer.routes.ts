import { Router } from "express";
import { getIssuerSummary, listIssuerProjects, listIssuerSubmissions, submitProjectForReview } from "../controllers/issuer.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:issuerId/summary", requireAuth(["issuer", "admin"]), getIssuerSummary);
router.get("/:issuerId/projects", requireAuth(["issuer", "admin"]), listIssuerProjects);
router.post("/submissions", requireAuth(["issuer"]), submitProjectForReview);
router.get("/submissions/mine", requireAuth(["issuer"]), listIssuerSubmissions);

export default router;
