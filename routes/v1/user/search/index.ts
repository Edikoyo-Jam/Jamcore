import { Router } from "express";
import getRoute from "./get.js";

const router = Router();

router.use(getRoute);

export default router;
