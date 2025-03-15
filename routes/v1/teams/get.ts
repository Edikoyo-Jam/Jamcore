import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";

const router = Router();

/**
 * Route to get teams from the database.
 */
router.get(
  "/",
  rateLimit(),

  async (_req, res) => {
    const teams = await db.team.findMany({
      include: {
        users: true,
        owner: true,
      },
    });

    res.send({ message: "Teams fetched", data: teams });
  }
);

export default router;
