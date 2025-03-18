import express from "express";
import authUser from "../../../middleware/authUser";
import getUser from "../../../middleware/getUser";
import getTargetTeam from "@middleware/getTargetTeam";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";
import logger from "@helper/logger";
import assertUserNotTargetTeamOwner from "@middleware/assertUserNotTargetTeamOwner";
import assertUserIsInTargetTeam from "@middleware/assertUserIsInTargetTeam";

var router = express.Router();

router.delete(
  "/",
  rateLimit(),

  authUser,
  getUser,
  getTargetTeam,
  assertUserIsInTargetTeam,
  assertUserNotTargetTeamOwner,

  async (_req, res) => {
    try {
      await db.team.update({
        where: {
          id: res.locals.targetTeam.id,
        },
        data: {
          users: {
            disconnect: { id: res.locals.user.id },
          },
        },
      });

      res.status(200).send({ message: "Left team" });
    } catch (error) {
      logger.error("Failed to delete team: ", error);
      res.status(500).send({ message: "Failed to leave team" });
    }
  }
);

export default router;
