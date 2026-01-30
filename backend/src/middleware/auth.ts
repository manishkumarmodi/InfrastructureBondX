import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./error-handler";
import { verifyAuthToken } from "../utils/token";

export type UserRole = "investor" | "issuer" | "admin";

function getBearerToken(header?: string) {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
}

export function requireAuth(roles?: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return next(new HttpError(401, "Missing authorization token"));
    }

    try {
      const payload = verifyAuthToken(token);
      req.auth = payload;

      if (roles && !roles.includes(payload.role)) {
        return next(new HttpError(403, "Insufficient permissions"));
      }

      return next();
    } catch (error) {
      return next(new HttpError(401, "Invalid or expired token", error));
    }
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req.headers.authorization);
  if (token) {
    try {
      req.auth = verifyAuthToken(token);
    } catch (error) {
      console.warn("Failed to verify optional auth token", error);
    }
  }
  next();
}
