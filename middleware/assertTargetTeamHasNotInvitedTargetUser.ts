import db from "@helper/db";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the requested team has already invited the target user
 * Requires getTargetTeam and getTargetUser to be used previously in the middleware chain.
 */
async function assertTargetTeamHasNotInvitedTargetUser(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!res.locals.targetTeam) {
    res.status(502).send({ message: "Target Team not gotten." });
  }

  if (!res.locals.targetUser) {
    res.status(502).send({ message: "Target User not gotten." });
  }

  const application = await db.teamInvite.findFirst({
    where: {
      userId: res.locals.targetUser.id,
      teamId: res.locals.targetTeam.id,
    },
  });

  if (application) {
    res
      .status(401)
      .send({ message: "User has already been invited to the team." });
    return;
  }

  next();
}

export default assertTargetTeamHasNotInvitedTargetUser;
