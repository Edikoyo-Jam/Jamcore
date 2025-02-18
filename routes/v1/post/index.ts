import { Router } from "express";
import getRoute from "./get.js";
import deleteRoute from "./delete.js";
//import putRoute from "./put.js";
import postRoute from "./post.js";
import db from "@helper/db.js";
import jwt from "jsonwebtoken";

const router = Router();

router.use(getRoute);
router.use(deleteRoute);
//router.use(putRoute);
router.use(postRoute);

// TODO: Old Code: Clean up (add to put?)
router.post("/sticky", async function (req, res) {
  const { postId, sticky, username } = req.body;

  if (!postId || !username) {
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

  await db.post.update({
    where: {
      id: postId,
    },
    data: {
      sticky,
    },
  });

  res.send("Post updated");
});

export default router;
