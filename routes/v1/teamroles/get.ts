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

  async (_req, res) => {
    const roles = await db.teamRole.findMany();

    res.send({ message: "Roles fetched", data: roles });
  }
);

export default router;
