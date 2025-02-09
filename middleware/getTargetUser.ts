import { Request, Response, NextFunction } from "express";
import db from "../helper/db";

/**
 * Middleware to fetch the target user from the database.
 */
async function getTargetUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { targetUserId, targetUserSlug } = req.body;
  const {
    targetUserId: queryTargetUserId,
    targetUserSlug: queryTargetUserSlug,
  } = req.query;

  // Use query parameters if available, otherwise fallback to body
  const userId = targetUserId || queryTargetUserId;
  const userSlug = targetUserSlug || queryTargetUserSlug;

  if ((!userId || isNaN(parseInt(userId as string))) && !userSlug) {
    res.status(502).send("User id or slug missing.");
    return;
  }

  let user;

  if (userId && !isNaN(parseInt(userId as string))) {
    let idnumber = parseInt(userId as string);

    user = await db.user.findUnique({
      where: {
        id: idnumber,
      },
    });
  } else {
    user = await db.user.findUnique({
      where: {
        slug: userSlug as string,
      },
    });
  }

  if (!user) {
    res.status(401).send("User missing.");
    return;
  }

  res.locals.targetUser = user;
  next();
}

export default getTargetUser;
