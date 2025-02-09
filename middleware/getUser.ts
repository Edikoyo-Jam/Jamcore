import { Request, Response, NextFunction } from "express";
import db from "../helper/db";

async function getUser(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userSlug } = res.locals;

  if (!userSlug) {
    res.status(502).send("User slug missing.");
    return;
  }

  const user = await db.user.findUnique({
    where: {
      slug: userSlug,
    },
    select: {
      id: true,
      name: true,
      bio: true,
      profilePicture: true,
      createdAt: true,
      slug: true,
      mod: true,
      admin: true,
      jams: true,
    },
  });

  if (!user) {
    res.status(401).send("User missing.");
    return;
  }

  res.locals.user = user;
  next();
}

export default getUser;
