import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const { sort, user } = req.query;

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

  let userId = null;
  if (user) {
    const userRecord = await prisma.user.findUnique({
      where: { slug: String(user) },
    });
    userId = userRecord ? userRecord.id : null;
  }

  const postsWithLikes = posts.map((post) => ({
    ...post,
    hasLiked: userId
      ? post.likes.some((like) => like.userId === userId)
      : false,
  }));

  res.send(postsWithLikes);
});

export default router;
