import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async (req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { category: true },
  });

  res.send(tags);
});

export default router;
