import { Router } from "express";
import db from "@helper/db";
import jwt from "jsonwebtoken";

const router = Router();

// TODO: clean

router.delete("/", async function (req, res) {
  const { postId, username } = req.body;

  if (!postId || isNaN(parseInt(postId)) || !username) {
    res.status(400).send("Invalid post ID.");
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

  const post = await db.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    res.status(404);
    res.send();
    return;
  }

  const user = await db.user.findUnique({
    where: { slug: username },
  });

  if (!user) {
    res.status(401);
    res.send();
    return;
  }

  const isAuthor = post.authorId === user.id;
  const isModerator = user.mod === true;

  if (!isAuthor && !isModerator) {
    res.status(403);
    res.send();
    return;
  }

  await db.post.delete({
    where: { id: postId },
  });

  res.send("Post deleted.");
});

export default router;
