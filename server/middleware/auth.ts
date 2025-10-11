import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function devAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Restore user from session if it exists
  if (req.session?.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
      };
    }
  }
  next();
}
