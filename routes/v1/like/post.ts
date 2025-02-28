import express from "express";
import authUser from "../../../middleware/authUser";
import getUser from "../../../middleware/getUser";
import getPostOrComment from "../../../middleware/getPostOrComment";
import db from "../../../helper/db";

var router = express.Router();

router.post(
  "/",

  authUser,
  getUser,
  getPostOrComment,

  async function (_req, res) {
    const { user, post, comment } = res.locals;
    const thingKey = post ? "postId" : "commentId";
    const thing = post ? post : comment;

    const conflictLike = await db.like.findFirst({
      where: {
        userId: user.id,
        [thingKey]: thing.id,
      },
    });

    if (conflictLike) {
      await db.like.deleteMany({
        where: {
          userId: user.id,
          [thingKey]: thing.id,
        },
      });
    } else {
      await db.like.create({
        data: {
          userId: user.id,
          [thingKey]: thing.id,
        },
      });
    }

    res.send({ message: "Like created" });
  }
);

export default router;
