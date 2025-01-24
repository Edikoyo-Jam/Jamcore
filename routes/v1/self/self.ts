import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getCurrentActiveJam } from "../../../services/jamService";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const authHeader = req.headers["authorization"];
  const refreshToken = req.cookies["refreshToken"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  const { username } = req.query;

  if (accessToken == null) {
    res.status(401);
    res.send();
    return;
  }
  if (refreshToken == null) {
    res.status(401);
    res.send();
    return;
  }
  if (!username) {
    res.status(401);
    res.send();
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500);
    res.send();
    return;
  }

  try {
    jwt.verify(accessToken, process.env.TOKEN_SECRET);
  } catch (error) {
    if (!refreshToken) {
      res.status(401);
      res.send("Access Denied. No refresh token provided.");
      return;
    }

    try {
      jwt.verify(refreshToken, process.env.TOKEN_SECRET);
      const accessToken = jwt.sign(
        { user: username },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        })
        .header("Authorization", accessToken);
    } catch (error) {
      res.status(400);
      res.send("Invalid Token.");
      return;
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      slug: username as string,
    },
    include: {
      jams: true,
    },
  });

  if (!user) {
    res.status(403);
    res.send();
    return;
  }

  res.send(JSON.stringify(user));
});


router.get("/current-game", async function (req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).send("Username is required.");
  }

  try {
    // Find the user by their slug
    const user = await prisma.user.findUnique({
      where: { slug: username as string },
      include: {
        contributedGames: {
          include: { jam: true }, // Include jam info for filtering
        },
      },
    });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Get the current active jam
    const activeJamResponse = await getCurrentActiveJam();
    const activeJam = activeJamResponse.jam;

    if (!activeJam) {
      return res.status(404).send("No active jam found.");
    }

    const contributedGameInCurrentJam = user.contributedGames.find(
      (game) => game.jam.id === activeJam.id
    );

    const currentGame = contributedGameInCurrentJam;

    if (!currentGame) {
      return res.status(200).json(null);
    }

    // Fetch full game details including contributors and author
    const fullGameDetails = await prisma.game.findUnique({
      where: { id: currentGame.id },
      include: {
        author: true,
        contributors: true,
        downloadLinks: true,
      },
    });

    res.json(fullGameDetails);
  } catch (error) {
    console.error("Error fetching current game:", error);
    res.status(500).send("Internal server error.");
  }
});



export default router;
