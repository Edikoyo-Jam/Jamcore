import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the requesting user is the owner of the target team.
 * Requires getUser and getTargetTeam to be used previously in the middleware chain.
 */
function assertUserNotTargetTeamOwner(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!res.locals.user) {
    res.status(502).send("User not gotten.");
  }

  if (!res.locals.targetTeam) {
    res.status(502).send("Target team not gotten.");
  }

  if (res.locals.targetTeam.ownerId == res.locals.user) {
    res.status(401).send("User is the team owner.");
    return;
  }

  next();
}

export default assertUserNotTargetTeamOwner;
