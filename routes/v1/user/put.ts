import { Router } from "express";
import { body } from "express-validator";
import getTargetUser from "@middleware/getTargetUser";
import authUser from "@middleware/authUser";
import getUser from "@middleware/getUser";
import assertUserModOrUserTargetUser from "@middleware/assertUserModOrUserTargetUser";
import db from "@helper/db";
import rateLimit from "@middleware/rateLimit";

const router = Router();

/**
 * Route to edit a user in the database.
 * Can be done by mods or by self.
 * Requires Authentication.
 */
router.put(
  "/",
  rateLimit(),

  body("name"),

  authUser,
  getUser,
  getTargetUser,
  assertUserModOrUserTargetUser,

  async (req, res) => {
    const { email, profilePicture, bannerPicture, bio, name } = req.body;

    try {
      await db.user.update({
        where: {
          id: res.locals.user.id,
        },
        data: {
          email,
          profilePicture,
          bannerPicture,
          bio,
          name,
        },
      });

      res.status(200).send({ message: "User updated" });
    } catch (error) {
      console.error("Failed to update user: ", error);
      res.status(500).send({ message: "Failed to update user" });
    }
  }
);

export default router;
