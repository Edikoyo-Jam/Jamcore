import { Router } from "express";
import getRoute from "./get.js";
//import deleteRoute from "./delete.js";
import postRoute from "./post.js";

const router = Router();

router.use(getRoute);
//router.use(deleteRoute);
router.use(postRoute);

export default router;
