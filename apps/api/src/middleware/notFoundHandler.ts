import { Request, Response } from "express";
import { sendError } from "../utils/response";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    "ROUTE_NOT_FOUND"
  );
}
