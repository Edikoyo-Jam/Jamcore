import db from "@helper/db";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to see if a user slug already exists
 */
async function checkUsernameConflict(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.body.username) {
    res.status(502).send("There is no username given.");
  }

  const conflictuser = await db.user.findUnique({
    where: {
      slug: (req.body.username as string).toLowerCase().replace(" ", "_"),
    },
  });

  if (conflictuser) {
    res.status(409);
    res.send();
    return;
  }

  next();
}

export default checkUsernameConflict;
