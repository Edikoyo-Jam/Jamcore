import express from "express";
import authUser from "../../../middleware/authUser";
import getUser from "../../../middleware/getUser";
import getTargetTeam from "@middleware/getTargetTeam";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";
import logger from "@helper/logger";
import assertUserModOrUserTargetTeamOwner from "@middleware/assertUserModOrUserTargetTeamOwner";

var router = express.Router();

router.delete(
  "/",
  rateLimit(),

  authUser,
  getUser,
  getTargetTeam,
  assertUserModOrUserTargetTeamOwner,

  async (_req, res) => {
    try {
      await db.team.delete({
        where: {
          id: res.locals.targetTeam.id,
        },
      });

      logger.info(`Deleted team with id ${res.locals.targetTeam.id}`);
      res.status(200).send({ message: "Team deleted" });
    } catch (error) {
      logger.error("Failed to delete team: ", error);
      res.status(500).send({ message: "Failed to delete team" });
    }
  }
);

export default router;
