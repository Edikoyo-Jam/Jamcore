import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import getJam from "@middleware/getJam";
import db from "@helper/db";

const router = Router();

/**
 * Route to get the top theme from the database
 */
router.get(
  "/",
  rateLimit(),

  getJam,

  async (_req, res) => {
    const themes = await db.themeSuggestion.findMany({
      where: {
        jamId: res.locals.jam.id,
        votes2: {
          some: {},
        },
      },
      include: {
        votes2: true,
      },
    });

    const updatedThemes = themes.map((theme) => ({
      ...theme,
      stars: theme.votes2.filter((vote) => vote.voteScore == 3).length,
      likes: theme.votes2.filter((vote) => vote.voteScore == 1).length,
      voteAmount: theme.votes2.length,
      voteScore: theme.votes2.reduce((prev, curr) => prev + curr.voteScore, 0),
    }));

    const sortedThemes = updatedThemes.sort((a, b) =>
      a.voteScore != b.voteScore
        ? b.voteScore - a.voteScore
        : a.stars != b.stars
        ? b.stars - a.stars
        : a.likes != b.likes
        ? b.likes - a.likes
        : a.voteAmount != b.voteAmount
        ? b.voteAmount - a.voteAmount
        : a.id - b.id
    );

    res.send({ message: "Theme fetched", data: sortedThemes[0] });
  }
);

export default router;
