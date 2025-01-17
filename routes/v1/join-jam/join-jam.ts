import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
var router = express.Router();

router.post("/", async function (req, res) {
  const { userSlug, jamId } = req.body;

  if (!userSlug || !jamId) {
    res.status(400);
    res.send();
    return;
  }

  const authHeader = req.headers["authorization"];
  const refreshToken = req.cookies["refreshToken"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (accessToken == null) {
    res.status(401);
    res.send();
    return;
  }
  if (refreshToken == null) {
    res.status(401);
    res.send();
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500);
    res.send();
    return;
  }

  try {
    jwt.verify(accessToken, process.env.TOKEN_SECRET);
  } catch (error) {
    if (!refreshToken) {
      res.status(401);
      res.send("Access Denied. No refresh token provided.");
      return;
    }

    try {
      jwt.verify(refreshToken, process.env.TOKEN_SECRET);
      const accessToken = jwt.sign(
        { user: userSlug },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        })
        .header("Authorization", accessToken);
    } catch (error) {
      res.status(400);
      res.send("Invalid Token.");
      return;
    }
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
