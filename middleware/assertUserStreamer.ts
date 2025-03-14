import { Request, Response, NextFunction } from "express";

/**
 * Middleware that sends an error if the requesting user is not a streamer.
 * Requires getUser to be used previously in the middleware chain.
 */
function assertUserStreamer(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!res.locals.user) {
    res.status(502).send("User not gotten.");
  }

  if (!res.locals.user.twitch) {
    res.status(401).send("User is not a streamer.");
    return;
  }

  next();
}

export default assertUserStreamer;
