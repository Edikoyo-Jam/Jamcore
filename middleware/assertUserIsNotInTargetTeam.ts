import db from "@helper/db";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the user is already in the given team
 * Requires getTargetTeam and getUser to be used previously in the middleware chain.
 */
async function assertUserIsNotInTargetTeam(
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

  if (
    res.locals.targetTeam.users.filter((user) => user.id == res.locals.user.id)
      .length > 0
  ) {
    res.status(401).send({ message: "User is already in team." });
    return;
  }

  next();
}

export default assertUserIsNotInTargetTeam;
