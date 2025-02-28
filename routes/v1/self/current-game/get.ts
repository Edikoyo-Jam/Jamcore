import db from "@helper/db";
import rateLimit from "@middleware/rateLimit";
import { Router } from "express";
import { getCurrentActiveJam } from "services/jamService";

const router = Router();

router.get(
  "/",
  rateLimit(),

  async (req, res) => {
    const { username } = req.query;

    if (!username) {
      res.status(400).send("Username is required");
      return;
    }

    try {
      // Find the user by their slug
      const user = await db.user.findUnique({
        where: { slug: username as string },
        include: {
          contributedGames: {
            include: { jam: true }, // Include jam info for filtering
          },
        },
      });

      if (!user) {
        res.status(404).send("User not found.");
        return;
      }

      // Get the current active jam
      const activeJamResponse = await getCurrentActiveJam();
      const activeJam = activeJamResponse.futureJam;

      if (!activeJam) {
        res.status(404).send("No active jam found.");
        return;
      }

      const contributedGameInCurrentJam = user.contributedGames.find(
        (game) => game.jam.id === activeJam.id
      );

      const currentGame = contributedGameInCurrentJam;

      if (!currentGame) {
        res.status(200).json(null);
        return;
      }

      // Fetch full game details including contributors and author
      const fullGameDetails = await db.game.findUnique({
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
  }
);

export default router;
