// ============================================================
// ASYNC HANDLER — Wraps async route handlers to catch errors
// Eliminates the need for try/catch in every controller
// ============================================================

import { Request, Response, NextFunction } from "express";

/**
 * asyncHandler — Higher-order function that wraps an async Express handler.
 * If the handler throws, the error is forwarded to Express's error handler.
 *
 * @example
 *   router.get("/users", asyncHandler(async (req, res) => {
 *     const users = await UserService.findAll();
 *     res.json(users);
 *   }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
