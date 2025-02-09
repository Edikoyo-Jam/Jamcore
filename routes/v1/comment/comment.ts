import express from "express";
import jwt from "jsonwebtoken";
import db from "../../../helper/db";

var router = express.Router();

router.post("/", async function (req, res) {
  const { content, username, postId = null, commentId = null } = req.body;

  if (!content || !username || !(postId || commentId)) {
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
      res.status(400);
      res.send("Invalid Token.");
      return;
    }
  }

  const user = await db.user.findUnique({
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
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      res.status(401);
      res.send();
      return;
    }
  }

  if (commentId) {
    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      res.status(401);
      res.send();
      return;
    }
  }

  await db.comment.create({
    data: {
      content,
      authorId: user.id,
      postId: postId,
      commentId: commentId,
    },
  });

  res.send("Comment created");
});

export default router;
