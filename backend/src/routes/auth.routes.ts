import { Router } from "express";
import { completeKyc, getProfile, loginUser, registerUser } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", requireAuth(), getProfile);
router.post("/kyc", requireAuth(["investor", "issuer", "admin"]), completeKyc);

export default router;
