import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the requesting user is not a mod and not the target user.
 * Requires getUser and getTargetUser to be used previously in the middleware chain.
 */
function assertUserModOrUserTargetUser(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!res.locals.user) {
    res.status(502).send("User not gotten.");
  }

  if (!res.locals.targetUser) {
    res.status(502).send("Target user not gotten.");
  }

  if (!res.locals.user.mod && res.locals.targetUser.id != res.locals.user.id) {
    res
      .status(401)
      .send("Requesting user is not a mod and not the target user.");
    return;
  }

  next();
}

export default assertUserModOrUserTargetUser;
