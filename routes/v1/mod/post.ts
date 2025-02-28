import express from "express";
import authUser from "@middleware/authUser";
import getUser from "@middleware/getUser";
import getTargetUser from "@middleware/getTargetUser";
import db from "@helper/db";

var router = express.Router();

router.post(
  "/",

  authUser,
  getUser,
  getTargetUser,

  async function (req, res) {
    const { mod = false, admin = false } = req.body;

    if (!res.locals.user.admin) {
      res
        .status(403)
        .send({ message: "You are not authorized to perform this action." });
      return;
    }

    if (admin) {
      if (res.locals.targetUser.admin) {
        res.status(400).send({ message: "Target user is already an admin." });
        return;
      }

      await db.user.update({
        where: { id: res.locals.targetUser.id },
        data: { admin: true, mod: true },
      });

      res
        .status(200)
        .send({ message: "Target user has been promoted to admin." });
      return;
    }

    if (!res.locals.targetUser.admin) {
      await db.user.update({
        where: { id: res.locals.targetUser.id },
        data: { mod: mod },
      });

      res.status(200).send("Mod status updated.");
      return;
    }

    if (res.locals.targetUser.createdAt <= res.locals.user.createdAt) {
      res
        .status(403)
        .send(
          "You cannot demote admins who were added before or at the same time as you."
        );
      return;
    }

    await db.user.update({
      where: { id: res.locals.targetUser.id },
      data: { admin: false, mod: mod },
    });

    res.status(200).send({ message: "Target admin has been demoted." });
  }
);

export default router;
