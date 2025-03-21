import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import db from "@helper/db";

const router = Router();

/**
 * Route to get the rating categories from the database.
 */
router.get(
  "/",
  rateLimit(),

  async (_req, res) => {
    const categories = await db.ratingCategory.findMany({});

    res.send({
      message: "Categories fetched",
      data: categories,
    });
  }
);

export default router;
