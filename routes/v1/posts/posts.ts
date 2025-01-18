import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const posts = await prisma.post.findMany({
    take: 20,
    include: {
      author: true,
      flairs: true,
      likes: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  res.send(posts);
});

export default router;
