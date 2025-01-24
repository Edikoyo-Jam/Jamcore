import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const { id, slug } = req.query;

  if ((!id || isNaN(parseInt(id as string))) && !slug) {
    res.status(400);
    res.send();
    return;
  }

  if (id && !isNaN(parseInt(id as string))) {
    let idnumber = parseInt(id as string);

    const user = await prisma.user.findUnique({
      where: {
        id: idnumber,
      },
    });

    res.send(user);
  } else {
    const user = await prisma.user.findUnique({
      where: {
        slug: slug as string,
      },
    });

    res.send(user);
  }
});

router.put("/", async function (req, res) {
  const { slug, profilePicture } = req.body;

  if (!slug) {
    res.status(400);
    res.send();
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      slug,
    },
  });

  if (!user) {
    res.status(401);
    res.send();
    return;
  }

  const updatedUser = await prisma.user.update({
    where: {
      slug,
    },
    data: {
      profilePicture,
    },
  });

  res.send(updatedUser);
});



router.get("/search", async function (req, res) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).send("Search query is required");
    return;
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        profilePicture: true
      },
      take: 5 // Limit results
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send("Internal server error");
  }
});


export default router;
