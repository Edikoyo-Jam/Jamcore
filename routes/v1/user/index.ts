import { Router } from "express";
import getRoute from "./get.js";
import deleteRoute from "./delete.js";
import putRoute from "./put.js";
import postRoute from "./post.js";
import db from "@helper/db.js";

const router = Router();

router.use(getRoute);
router.use(deleteRoute);
router.use(putRoute);
router.use(postRoute);

export default router;

// TODO: OLD CODE: NEEDS TO BE CLEANED UP
router.get("/search", async function (req, res) {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    res.status(400).send("Search query is required");
    return;
  }

  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        profilePicture: true,
      },
      take: 5, // Limit results
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send("Internal server error");
  }
});
