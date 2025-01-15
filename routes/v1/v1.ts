import express from "express"

import post from "./post/post.js"
import posts from "./posts/posts.js"
import user from "./user/user.js"

var router = express.Router();

router.use('/post', post)
router.use('/posts', posts)
router.use('/user', user)

router.get('/', function(req, res) {
  res.send('API v1 Route');
});

export default router;