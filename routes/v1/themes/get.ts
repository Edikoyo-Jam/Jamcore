import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";
import authenticateUser from "@middleware/authUser";
import getUser from "@middleware/getUser";
import getJam from "@middleware/getJam";
import { checkJamParticipation } from "services/jamService";

const router = Router();

/**
 * Route to get themes from the database.
 */
router.get(
  "/",
  rateLimit(),
  authenticateUser,
  getUser,
  getJam,
  checkJamParticipation,

  async (_req, res) => {
    const themes = await db.themeSuggestion.findMany({
      include: {
        votes: {
          where: {
            userId: res.locals.user.id,
          },
        },
      },
    });

    res.send({ message: "Themes fetched", data: themes });
  }
);

export default router;
