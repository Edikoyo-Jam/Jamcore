import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the requesting user is not an admin.
 * Requires getUser to be used previously in the middleware chain.
 */
function assertUserAdmin(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!res.locals.user) {
    res.status(502).send("User not gotten.");
  }

  if (!res.locals.user.admin) {
    res.status(401).send("User is not an admin.");
    return;
  }

  next();
}

export default assertUserAdmin;
