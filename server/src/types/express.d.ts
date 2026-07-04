// ============================================================
// EXPRESS TYPE AUGMENTATION — Extends Express Request type
// Adds `user` property to req so controllers can access
// the authenticated user after the auth middleware runs
// ============================================================

import { TokenPayload } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      /** user — The authenticated user's token payload, set by authMiddleware */
      user?: TokenPayload;
    }
  }
}
