import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";

const router = Router();

/**
 * Route to get a jam from the database.
 */
router.get(
  "/",
  rateLimit(),

  async (req, res) => {
    const { filter = "current" } = req.query;

    let whereClause;

    switch (filter) {
      case "upcoming":
        whereClause = { startTime: { gt: new Date() } };
        break;
      case "current":
        whereClause = {
          endTime: { gt: new Date() },
          startTime: { lte: new Date() },
        };
        break;
      case "past":
        whereClause = { endTime: { lte: new Date() } };
        break;
    }

    const events = await db.event.findMany({
      where: whereClause,
      orderBy: { startTime: "asc" },
      include: {
        host: true,
      },
    });

    res.send({
      message: "Events fetched",
      data: events,
    });
  }
);

export default router;
