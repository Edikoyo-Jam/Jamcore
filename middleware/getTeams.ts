import { Request, Response, NextFunction } from "express";
import db from "../helper/db";

async function getTeams(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { teamId } = req.body;

  // If no team id provided gets the current team
  if (!teamId) {
    if (!res.locals.jam) {
      res.status(502).send("Jam missing.");
      return;
    }

    if (!res.locals.user) {
      res.status(502).send("User missing.");
      return;
    }

    const teams = db.team.findMany({
      where: {
        jamId: res.locals.jam.id,
        users: {
          some: {
            id: res.locals.user.id,
          },
        },
      },
    });

    if (!teams) {
      res.status(404).json({ message: "No team for the current jam found" });
      return;
    }

    res.locals.teams = teams;
    next();
    return;
  }

  const team = await db.team.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    res.status(404).send("Team missing.");
    return;
  }

  res.locals.teams = [team];
  next();
}

export default getTeams;
