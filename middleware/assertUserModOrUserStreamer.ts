import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the requesting user is not a mod or a streamer.
 * Requires getUser to be used previously in the middleware chain.
 */
function assertUserModOrUserStreamer(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!res.locals.user) {
    res.status(502).send("User not gotten.");
  }

  if (!res.locals.user.mod && !res.locals.user.twitch) {
    res.status(401).send("Requesting user is not a mod and not a streaner.");
    return;
  }

  next();
}

export default assertUserModOrUserStreamer;
