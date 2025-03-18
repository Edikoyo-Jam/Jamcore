import express from "express";
import authUser from "../../../middleware/authUser";
import getUser from "../../../middleware/getUser";
import getJam from "@middleware/getJam";
import db from "@helper/db";
import rateLimit from "@middleware/rateLimit";

var router = express.Router();

router.post(
  "/",
  rateLimit(),

  authUser,
  getUser,
  getJam,

  async (_req, res) => {
    await db.team.create({
      data: {
        ownerId: res.locals.user.id,
        jamId: res.locals.jam.id,
        users: {
          connect: { id: res.locals.user.id },
        },
      },
    });

    res.send({ message: "Team created" });
  }
);

export default router;
