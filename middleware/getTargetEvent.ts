import { Request, Response, NextFunction } from "express";
import db from "../helper/db";

/**
 * Middleware to fetch the target user from the database.
 */
async function getTargetEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { targetEventId, targetEventSlug } = req.body;
  const {
    targetEventId: queryTargetEventId,
    targetEventSlug: queryTargetEventSlug,
  } = req.query;

  // Use query parameters if available, otherwise fallback to body
  const eventId = targetEventId || queryTargetEventId;
  const eventSlug = targetEventSlug || queryTargetEventSlug;

  if ((!eventId || isNaN(parseInt(eventId as string))) && !eventSlug) {
    res.status(502).send("Event id or slug missing.");
    return;
  }

  let event;

  if (eventId && !isNaN(parseInt(eventId as string))) {
    let idnumber = parseInt(eventId as string);

    event = await db.event.findUnique({
      where: {
        id: idnumber,
      },
    });
  } else {
    event = await db.event.findUnique({
      where: {
        slug: eventSlug as string,
      },
    });
  }

  if (!event) {
    res.status(404).send("Event missing.");
    return;
  }

  res.locals.targetEvent = event;
  next();
}

export default getTargetEvent;
