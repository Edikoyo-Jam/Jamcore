import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const { username } = req.query;

  if (token == null) {
    res.status(401);
    res.send();
    return;
  }
  if (!username) {
    res.status(401);
    res.send();
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500);
    res.send();
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err: any) => {
    if (err) {
      console.error(err);
      res.status(403);
      res.send();
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        slug: username as string,
      },
      include: {
        jams: true,
      },
    });

    if (!user) {
      res.status(403);
      res.send();
      return;
    }

    res.send(JSON.stringify(user));
  });
});

export default router;
