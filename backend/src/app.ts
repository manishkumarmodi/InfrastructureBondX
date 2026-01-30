import express from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import investorRoutes from "./routes/investor.routes";
import issuerRoutes from "./routes/issuer.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/investors", investorRoutes);
app.use("/api/issuers", issuerRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
