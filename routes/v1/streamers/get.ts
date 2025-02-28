import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import logger from "@helper/logger";
import db from "@helper/db";

const router = Router();

/**
 * Route to get streamers from the database.
 */
router.get(
  "/",
  rateLimit(),

  async (_req, res) => {
    try {
      const featuredStreamers = await db.featuredStreamer.findMany();
      res.json({ message: "Fetched streamers", data: featuredStreamers });
    } catch (error) {
      logger.error("Error fetching featured streamers:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
