import { Router } from "express";
import getTargetUser from "@middleware/getTargetUser";
import db from "@helper/db";
import authUser from "@middleware/authUser";
import getUser from "@middleware/getUser";
import assertUserModOrUserTargetUser from "@middleware/assertUserModOrUserTargetUser";
import rateLimit from "@middleware/rateLimit";
import logger from "@helper/logger";

const router = Router();

/**
 * Route to delete a user from the database.
 * Used for removals by mods or for self deletes.
 * Requires Authentication.
 */
router.delete(
  "/",
  rateLimit(),

  authUser,
  getUser,
  getTargetUser,
  assertUserModOrUserTargetUser,

  async (_req, res) => {
    try {
      await db.user.delete({
        where: {
          id: res.locals.targetUser.id,
        },
      });

      logger.info(`Deleted user with id ${res.locals.targetUser.id}`);
      res.status(200).send({ message: "User deleted" });
    } catch (error) {
      logger.error("Failed to delete user: ", error);
      res.status(500).send({ message: "Failed to delete user" });
    }
  }
);

export default router;
