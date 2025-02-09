import express from "express";
import authUser from "../../../middleware/authUser";
import getUser from "../../../middleware/getUser";
import getJam from "../../../middleware/getJam";
import { PrismaClient } from "@prisma/client";
import { userIsInJam } from "../../../helper/jam";

const prisma = new PrismaClient();
var router = express.Router();

router.post("/", authUser, getUser, getJam, async function (_req, res) {
  const { user, jam } = res.locals;

  if (userIsInJam(user, jam)) {
    res.status(401).send("You already joined this jam");
    return;
  }

  await prisma.jam.update({
    where: {
      id: jam.id,
    },
    data: {
      users: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.send("Joined jam");
});

export default router;
