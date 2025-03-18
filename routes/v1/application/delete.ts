import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";
import authUser from "@middleware/authUser";
import getUser from "@middleware/getUser";

const router = Router();

/**
 * Route to delete an application
 */
router.delete(
  "/",
  rateLimit(),

  authUser,
  getUser,

  async (req, res) => {
    const { accept, inviteId } = req.body;

    const invite = await db.teamApplication.findUnique({
      where: {
        id: inviteId,
      },
    });

    if (!invite) {
      res.status(401).send({ message: "Invalid application" });
      return;
    }

    await db.teamApplication.delete({
      where: {
        id: inviteId,
      },
    });

    if (accept) {
      await db.team.update({
        where: { id: invite.teamId },
        data: {
          users: {
            connect: {
              id: invite.userId,
            },
          },
        },
      });
    }

    res.send({ message: "Application accepted" });
  }
);

export default router;
