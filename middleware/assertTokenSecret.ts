import { Request, Response, NextFunction } from "express";

/**
 * Middleware to see if a token secret is defined
 */
function assertTokenSecret(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!process.env.TOKEN_SECRET) {
    res.status(502).send("There is no token secret.");
  }

  next();
}

export default assertTokenSecret;
