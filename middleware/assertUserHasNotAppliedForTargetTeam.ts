import db from "@helper/db";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the user has already applied for the target team
 * Requires getTargetTeam and getUser to be used previously in the middleware chain.
 */
async function assertUserHasNotAppliedForTargetTeam(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!res.locals.targetTeam) {
    res.status(502).send({ message: "Target Team not gotten." });
  }

  if (!res.locals.user) {
    res.status(502).send({ message: "User not gotten." });
  }

  const application = await db.teamApplication.findFirst({
    where: {
      userId: res.locals.user.id,
      teamId: res.locals.targetTeam.id,
    },
  });

  if (application) {
    res.status(401).send({ message: "User has already applied for team." });
    return;
  }

  next();
}

export default assertUserHasNotAppliedForTargetTeam;
