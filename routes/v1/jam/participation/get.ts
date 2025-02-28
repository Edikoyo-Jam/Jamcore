import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import logger from "@helper/logger";
import db from "@helper/db";
import getJam from "@middleware/getJam";
import authUser from "@middleware/authUser";

const router = Router();

/**
 * Route to get a jam from the database.
 */
router.get(
  "/",
  rateLimit(),

  getJam,
  authUser,

  async (_req, res) => {
    logger.info(`Checking if user ${res.locals.userSlug} is in jam`);

    const hasJoined = await db.jam.findFirst({
      where: {
        id: res.locals.jam.id,
        users: {
          some: {
            slug: res.locals.userSlug,
          },
        },
      },
    });

    if (hasJoined) {
      res.send({ message: "This user has joined the jam", data: true });
    } else {
      res.send({ message: "This user has not joined the jam", data: false });
    }
  }
);

export default router;
