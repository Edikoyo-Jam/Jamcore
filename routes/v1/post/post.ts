import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.post("/", async function (req, res) {
  const { title, content, username } = req.body;

  if (!title || !content || !username) {
    res.status(400);
    res.send();
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      slug: username,
    },
  });

  if (!user) {
    res.status(401);
    res.send();
    return;
  }

  await prisma.post.create({
    data: {
      title,
      content,
      authorId: user.id,
    },
  });

  res.send("Post created");
});

router.get("/", async function (req, res) {
  const { id } = req.query;

  if (!id || isNaN(parseInt(id as string))) {
    res.status(400);
    res.send();
    return;
  }

  let idnumber = parseInt(id as string);

  const post = await prisma.post.findUnique({
    where: {
      id: idnumber,
    },
  });

  res.send(post);
});

export default router;
