import { Request, Response, NextFunction } from "express";
import db from "../helper/db";

async function getJam(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { jamId } = req.body;

  if (!jamId) {
    res.status(502).send("Jam id missing.");
    return;
  }

  const jam = await db.jam.findUnique({
    where: {
      id: jamId,
    },
    include: {
      users: true,
    },
  });

  if (!jam) {
    res.status(404).send("Jam missing.");
    return;
  }

  res.locals.jam = jam;
  next();
}

export default getJam;
