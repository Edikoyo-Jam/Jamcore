import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const { sort } = req.query;

  let orderBy = {};

  if (sort === "oldest") {
    orderBy = { id: "asc" };
  } else if (sort === "newest") {
    orderBy = { id: "desc" };
  } else if (sort === "top") {
    orderBy = {
      likes: {
        _count: "desc",
      },
    };
  } else {
    orderBy = { id: "desc" };
  }

  const posts = await prisma.post.findMany({
    take: 20,
    include: {
      author: true,
      flairs: true,
      likes: true,
    },
    orderBy,
  });

  res.send(posts);
});

export default router;
