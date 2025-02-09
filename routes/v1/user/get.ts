import { Router } from "express";
import getTargetUser from "@middleware/getTargetUser";
import rateLimit from "@middleware/rateLimit";
import logger from "@helper/logger";

const router = Router();

/**
 * Route to get a user from the database.
 */
router.get(
  "/",
  rateLimit(),

  getTargetUser,

  (_req, res) => {
    logger.info(`User with id ${res.locals.targetUser.id} fetched`);
    res.send({ message: "User fetched", data: res.locals.targetUser });
  }
);

export default router;
