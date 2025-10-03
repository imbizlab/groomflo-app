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

export async function devAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  let user = await storage.getUserByUsername("demo-user");
  
  if (!user) {
    user = await storage.createUser({
      username: "demo-user",
      password: "demo-password",
    });
  }
  
  req.user = {
    id: user.id,
    username: user.username,
  };
  
  next();
}
