import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = req.cookies["refreshToken"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken || !refreshToken) {
    return res.status(401).send("Unauthorized: Missing tokens.");
  }

  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
    console.log("Decoded Access Token:", decoded);

    // Extract username from access token
    const username = decoded.user || decoded.name; // Support both fields
    if (!username) {
      throw new Error("Access token missing 'user' or 'name' field");
    }

    req.user = { username }; // Attach user info to request object
    next();
  } catch (error) {
    console.error("Access Token Error:", error.message);

    // If access token is invalid, try refreshing it
    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
      console.log("Decoded Refresh Token:", decodedRefresh);

      // Extract username from refresh token
      const username = decodedRefresh.user || decodedRefresh.name; // Support both fields
      if (!username) {
        throw new Error("Refresh token missing 'user' or 'name' field");
      }

      // Generate a new access token
      const newAccessToken = jwt.sign(
        { user: username },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      }).header("Authorization", newAccessToken);

      req.user = { username }; // Attach user info to request object
      next();
    } catch (refreshError) {
      console.error("Refresh Token Error:", refreshError.message);
      return res.status(401).send("Unauthorized: Invalid tokens.");
    }
  }
};