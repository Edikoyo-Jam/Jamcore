import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import logger from "@helper/logger";
import getTargetEvent from "@middleware/getTargetEvent";

const router = Router();

/**
 * Route to get an event from the database.
 */
router.get(
  "/",
  rateLimit(),

  getTargetEvent,

  (_req, res) => {
    logger.info(`Event with id ${res.locals.targetEvent.id} fetched`);
    res.send({ message: "Event fetched", data: res.locals.targetEvent });
  }
);

export default router;
