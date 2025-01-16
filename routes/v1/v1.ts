import express from "express";

import login from "./login/login.js";
import post from "./post/post.js";
import posts from "./posts/posts.js";
import user from "./user/user.js";
import self from "./self/self.js";

var router = express.Router();

router.use("/login", login);
router.use("/post", post);
router.use("/posts", posts);
router.use("/user", user);
router.use("/self", self);

router.get("/", function (req, res) {
  res.send("API v1 Route");
});

export default router;
