import { Router } from "express";
import authUser from "@middleware/authUser";
import rateLimit from "@middleware/rateLimit";

const router = Router();

/**
 * Route to delete a session from the database.
 * Used for logging out.
 */
router.delete(
  "/",
  rateLimit(),

  authUser,

  async (_req, res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });
    res.status(200);
    res.send({ message: "Logged out successfully" });
  }
);

export default router;
