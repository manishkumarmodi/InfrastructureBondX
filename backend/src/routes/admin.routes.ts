import { Router } from "express";
import { approveSubmission, getAdminSummary, listSubmissions, rejectSubmission } from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/summary", requireAuth(["admin"]), getAdminSummary);
router.get("/submissions", requireAuth(["admin"]), listSubmissions);
router.patch("/submissions/:submissionId/approve", requireAuth(["admin"]), approveSubmission);
router.patch("/submissions/:submissionId/reject", requireAuth(["admin"]), rejectSubmission);

export default router;
