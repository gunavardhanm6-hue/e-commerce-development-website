// ============================================================
// VALIDATE REQUEST — Zod schema validation middleware
// Validates req.body, req.query, or req.params against a Zod schema
// ============================================================

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HTTP_STATUS } from "../common/constants";

/**
 * validateRequest — Middleware factory that validates request data
 * against a provided Zod schema. If validation fails, returns 400
 * with detailed error messages.
 *
 * @param schema - The Zod schema to validate against
 * @param source - Which part of the request to validate ("body" | "query" | "params")
 *
 * @example
 *   router.post("/register", validateRequest(registerSchema), registerController);
 */
export const validateRequest = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and replace with validated data (strips unknown fields)
      req[source] = schema.parse(req[source]);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = (error as any).errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Validation failed",
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};
