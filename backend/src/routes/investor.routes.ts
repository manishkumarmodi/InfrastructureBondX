import { Router } from "express";
import { getInvestorPortfolio, getInvestorTransactions, recordInvestment } from "../controllers/investor.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/investments", requireAuth(["investor"]), recordInvestment);
router.get("/:investorId/portfolio", requireAuth(["investor", "admin"]), getInvestorPortfolio);
router.get("/:investorId/transactions", requireAuth(["investor", "admin"]), getInvestorTransactions);

export default router;
