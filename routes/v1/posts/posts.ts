import express from "express";
import { PrismaClient } from "@prisma/client";
import { PostTime } from "../../../types/PostTimes";

const prisma = new PrismaClient();
var router = express.Router();

type WhereType = {
  createdAt?: {};
  tags?: {};
};

router.get("/", async function (req, res) {
  const { sort = "newest", time = "all", user, tags } = req.query;

  let orderBy = {};
  let where: WhereType = {};
  const now = new Date();

  if (time !== "all") {
    const timeMapping: Record<PostTime, number> = {
      hour: 1,
      three_hours: 3,
      six_hours: 6,
      twelve_hours: 12,
      day: 24,
      week: 7 * 24,
      month: 30 * 24,
      three_months: 3 * 30 * 24,
      six_months: 6 * 30 * 24,
      nine_months: 9 * 30 * 24,
      year: 365 * 24,
      all: 0,
    };

    const hours = timeMapping[time as PostTime] || 0;
    where["createdAt"] = {
      gte: new Date(now.getTime() - hours * 60 * 60 * 1000),
    };
  }

  if (tags) {
    const splitTags = (tags as string).split("_");
    const splitSplitTags = splitTags.map((tag) => ({
      id: tag.split(",")[0],
      value: tag.split(",")[1],
    }));

    const includeTags = splitSplitTags
      .filter((tag) => tag.value === "1")
      .map((tag) => parseInt(tag.id));

    const excludeTags = splitSplitTags
      .filter((tag) => tag.value === "-1")
      .map((tag) => parseInt(tag.id));

    if (includeTags.length > 0) {
      where["tags"] = {
        some: { id: { in: includeTags } },
      };
    }

    console.log(includeTags);

    if (excludeTags.length > 0) {
      where["tags"] = {
        ...where["tags"],
        none: { id: { in: excludeTags } },
      };
    }

    console.log(excludeTags);
  }

  // Handle sort filters
  if (sort === "oldest") {
    orderBy = { id: "asc" };
  } else if (sort === "newest") {
    orderBy = { id: "desc" };
  } else if (sort === "top") {
    orderBy = { likes: { _count: "desc" } };
  }

  const posts = await prisma.post.findMany({
    take: 20,
    where,
    include: {
      author: true,
      tags: true,
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
