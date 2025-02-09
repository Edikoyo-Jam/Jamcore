import { Request, Response, NextFunction } from "express";

function checkMod(req: Request, res: Response, next: NextFunction): void {
  const { admin } = res.locals.user;

  if (!admin) {
    res.status(401).send("User is not an admin.");
    return;
  }

  next();
}

export default checkMod;
