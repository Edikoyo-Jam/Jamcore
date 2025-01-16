import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.post("/", async function (req, res) {
  const { userSlug, jamId } = req.body;

  if (!userSlug || !jamId) {
    res.status(400);
    res.send();
    return;
  }

  const existingUser = await prisma.jam.findFirst({
    where: {
      id: jamId,
      users: {
        some: {
          slug: userSlug,
        },
      },
    },
  });

  if (existingUser) {
    res.status(401);
    res.send();
    return;
  }

  await prisma.jam.update({
    where: {
      id: jamId,
    },
    data: {
      users: {
        connect: {
          slug: userSlug,
        },
      },
    },
  });

  res.send("ok");
});

export default router;
