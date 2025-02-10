import express from "express";

import post from "./post/index.js";
import posts from "./posts/posts.js";
import user from "./user/index.js";
import self from "./self/self.js";
import jams from "./jams/jams.js";
import joinJam from "./join-jam/join-jam.js";
import like from "./like/like.js";
import streamers from "./streamers/streamers.js";
import session from "./session/index.js";
import tags from "./tags/tags.js";
import themes from "./themes/themes.js";
import mod from "./mod/mod.js";
import games from "./games/games.js";
import comment from "./comment/comment.js";
import image from "./image/index.js";

var router = express.Router();

router.use("/user", user);
router.use("/session", session);
router.use("/post", post);
router.use("/image", image);

router.use("/posts", posts);
router.use("/self", self);
router.use("/jams", jams);
router.use("/join-jam", joinJam);
router.use("/like", like);
router.use("/streamers", streamers);
router.use("/tags", tags);
router.use("/themes", themes);
router.use("/games", games);
router.use("/mod", mod);
router.use("/comment", comment);

router.get("/", function (req, res) {
  res.send("API v1 Route");
});

export default router;
