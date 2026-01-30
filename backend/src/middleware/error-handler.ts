import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route ${req.path} not found` });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  if ((err as { name?: string }).name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  console.error("Unexpected error", err);
  return res.status(500).json({ message: "Internal server error" });
}
