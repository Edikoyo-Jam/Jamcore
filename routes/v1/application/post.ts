import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";
import authUser from "@middleware/authUser";
import getUser from "@middleware/getUser";
import getTargetTeam from "@middleware/getTargetTeam";
import assertTargetTeamApplicationsOpen from "@middleware/assertTargetTeamApplicationsOpen";
import assertUserHasNotAppliedForTargetTeam from "@middleware/assertUserHasNotAppliedForTargetTeam";
import assertUserIsNotInTargetTeam from "@middleware/assertUserIsNotInTargetTeam";

const router = Router();

/**
 * Route to create an application to a team.
 */
router.post(
  "/",
  rateLimit(),

  authUser,
  getUser,
  getTargetTeam,
  assertTargetTeamApplicationsOpen,
  assertUserHasNotAppliedForTargetTeam,
  assertUserIsNotInTargetTeam,

  async (req, res) => {
    const { content } = req.body;

    await db.teamApplication.create({
      data: {
        userId: res.locals.user.id,
        teamId: res.locals.targetTeam.id,
        content: content ? content : null,
      },
    });

    res.send({ message: "Application created" });
  }
);

export default router;
