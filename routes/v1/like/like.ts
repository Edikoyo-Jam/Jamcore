import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
var router = express.Router();

router.post("/", async function (req, res) {
  const { postId, commentId, username } = req.body;

  if (!(postId || commentId) || !username) {
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
        { user: username },
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
      res.status(401);
      res.send("Invalid Token.");
      return;
    }
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

  if (postId) {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        likes: true,
      },
    });

    if (!post) {
      res.status(401);
      res.send();
      return;
    }

    let postLikes = post.likes.length;
    let action = "";

    const conflictlike = await prisma.like.findFirst({
      where: {
        userId: user.id,
        postId,
      },
    });

    if (conflictlike) {
      await prisma.like.deleteMany({
        where: {
          userId: user.id,
          postId,
        },
      });
      postLikes -= 1;
      action = "unlike";
    } else {
      await prisma.like.create({
        data: {
          userId: user.id,
          postId,
        },
      });
      postLikes += 1;
      action = "like";
    }

    res.send({
      action: action,
      likes: postLikes,
    });
  }
});

export default router;
