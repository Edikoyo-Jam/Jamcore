import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = req.cookies["refreshToken"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken || !refreshToken) {
    return res.status(401).send("Unauthorized: Missing tokens.");
  }

  if (!process.env.TOKEN_SECRET) {
    return res.status(500).send("Server Error: Missing TOKEN_SECRET.");
  }

  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
    req.user = { username: decoded.user }; // Attach user info to request object
    next();
  } catch (error) {
    console.error("Access token invalid or expired:", error.message);

    // Verify refresh token
    try {
      const refreshDecoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
      const newAccessToken = jwt.sign(
        { user: refreshDecoded.user },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // Set new access token in response headers
      res.setHeader("Authorization", `Bearer ${newAccessToken}`);
      req.user = { username: refreshDecoded.user }; // Attach user info to request object
      next();
    } catch (refreshError) {
      console.error("Refresh token invalid:", refreshError.message);
      return res.status(403).json({ error: "Invalid token" });
    }
  }
};