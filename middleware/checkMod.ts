import { Request, Response, NextFunction } from "express";

function checkMod(req: Request, res: Response, next: NextFunction): void {
  const { mod } = res.locals.user;

  if (!mod) {
    res.status(401).send("User is not a mod.");
    return;
  }

  next();
}

export default checkMod;
