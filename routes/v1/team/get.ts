import express from "express";
import authUser from "../../../middleware/authUser";
import getUser from "../../../middleware/getUser";
import getTargetTeam from "@middleware/getTargetTeam";
import rateLimit from "@middleware/rateLimit";

var router = express.Router();

router.get(
  "/",
  rateLimit(),

  authUser,
  getUser,
  getTargetTeam,

  async (_req, res) => {
    res.send({ message: "Team found", data: res.locals.targetTeam });
  }
);

export default router;
