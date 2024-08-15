import type { Request, Response, NextFunction } from "express";
import { supabase } from "../shared/supabase";
import { logger } from "../shared/logging";

export async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const headers = req.headers;
  const token = headers["x-supabase-jwt"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided!" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token as string);

    if (!user || error) {
      logger.error({ error }, "cannot_authenticate_user");
      return res
        .status(401)
        .json({ message: `Cannot authenticate user: ${error?.message}` });
    }

    req.user = user;
    req.supabaseJwt = token as string;
    next();
  } catch (error) {
    logger.error({ error }, "invalid_token");
    res.status(400).json({ message: "Invalid Token!", error });
  }
}
