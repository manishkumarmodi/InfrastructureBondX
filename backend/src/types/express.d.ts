import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload & {
        userId: string;
        role: "investor" | "issuer" | "admin";
      };
    }
  }
}

export {};
