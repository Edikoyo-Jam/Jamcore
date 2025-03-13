import { Router } from "express";
import db from "@helper/db";
import rateLimit from "@middleware/rateLimit";
import authUser from "@middleware/authUser";
import getUser from "@middleware/getUser";
import { parseZonedDateTime } from "@internationalized/date";
import assertUserModOrUserStreamer from "@middleware/assertUserModOrUserStreamer";

const router = Router();

/**
 * Route to add an event to the database.
 */
router.post(
  "/",
  rateLimit(),

  authUser,
  getUser,
  assertUserModOrUserStreamer,

  async function (req, res) {
    const { title, content, start, end } = req.body;

    if (!title || !content || !start || !end) {
      res.status(400);
      res.send();
      return;
    }

    let slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let slug = slugBase;
    let count = 1;

    while (true) {
      const existingPost = await db.event.findUnique({
        where: { slug },
      });

      if (!existingPost) break;

      count++;
      slug = `${slugBase}-${count}`;
    }

    const newpost = await db.event.create({
      data: {
        name: title,
        slug,
        startTime: parseZonedDateTime(start).toDate(),
        endTime: parseZonedDateTime(end).toDate(),
        hostId: res.locals.user.id,
        categoryId: 1,
      },
    });

    res.send("Event created");
  }
);

export default router;
