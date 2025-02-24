import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { checkPasswordHash } from "../../../helper/password";

const prisma = new PrismaClient();
var router = express.Router();

// TODO: Clean up

router.post("/", async function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    res.send();
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      slug: (username as string).toLowerCase(),
    },
  });

  if (!user) {
    res.status(401);
    res.send();
    return;
  }

  if (!(await checkPasswordHash(password, user.password))) {
    res.status(401);
    res.send();
    return;
  }

  if (!process.env.TOKEN_SECRET) {
    res.status(500);
    res.send();
    return;
  }

  const accessToken = jwt.sign({ name: user.slug }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ name: user.slug }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    })
    .header("Authorization", accessToken)
    .send({
      user: user,
      token: accessToken,
    });
});

export default router;
