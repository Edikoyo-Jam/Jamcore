import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the requested team does not have applications open
 * Requires getTargetTeam to be used previously in the middleware chain.
 */
function assertTeamApplicationsOpen(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!res.locals.targetTeam) {
    res.status(502).send("Target Team not gotten.");
  }

  if (!res.locals.targetTeam.applicationsOpen) {
    res.status(401).send("Team applications are not open.");
    return;
  }

  next();
}

export default assertTeamApplicationsOpen;
