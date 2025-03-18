import db from "@helper/db";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the target user is already in the given team
 * Requires getTargetTeam and getTargetUser to be used previously in the middleware chain.
 */
async function assertTargetUserIsNotInTargetTeam(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!res.locals.targetTeam) {
    res.status(502).send({ message: "Target Team not gotten." });
  }

  if (!res.locals.targetUser) {
    res.status(502).send({ message: "Target user not gotten." });
  }

  if (
    res.locals.targetTeam.users.filter(
      (user) => user.id == res.locals.targetUser.id
    ).length > 0
  ) {
    res.status(401).send({ message: "Target user is already in team." });
    return;
  }

  next();
}

export default assertTargetUserIsNotInTargetTeam;
