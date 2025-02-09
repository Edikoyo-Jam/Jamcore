import { Router } from "express";
import deleteRoute from "./delete.js";
import postRoute from "./post.js";

const router = Router();

router.use(deleteRoute);
router.use(postRoute);

export default router;
