import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const jams = await prisma.jam.findMany({
    take: 10,
    orderBy: {
      id: "desc",
    },
  });

  res.send(jams);
});

export default router;
