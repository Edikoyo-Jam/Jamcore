import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  getCurrentActiveJam,
  checkJamParticipation,
} from "../../../services/jamService";
import authenticateUser from "../../../middleware/authUser";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/suggestion",
  authenticateUser,
  checkJamParticipation,
  async function (req, res) {
    const username = res.locals.userSlug;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    // Get current active jam
    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam) {
      return res.status(404).send("No active jam found.");
    }

    // Fetch user's suggestions for the current jam
    try {
      const suggestions = await prisma.themeSuggestion.findMany({
        where: {
          userId: user.id,
          jamId: activeJam.futureJam.id,
        },
      });

      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

router.get(
  "/random",
  authenticateUser,
  checkJamParticipation,
  async (req, res) => {
    const username = res.locals.userSlug;

    const user = await prisma.user.findUnique({ where: { slug: username } });
    if (!user) return res.status(401).send("Unauthorized");

    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam)
      return res.status(404).send("No active jam found.");

    try {
      // Fetch all eligible suggestion IDs
      const eligibleSuggestions = await prisma.themeSuggestion.findMany({
        where: {
          jamId: activeJam.futureJam.id,
          id: {
            notIn: (
              await prisma.themeVote.findMany({
                where: {
                  userId: user.id,
                  jamId: activeJam.futureJam.id,
                },
                select: { themeSuggestionId: true },
              })
            ).map((vote) => vote.themeSuggestionId),
          },
        },
        select: { id: true }, // Only fetch IDs to reduce data transfer
      });

      if (eligibleSuggestions.length === 0) {
        return res.status(404).send("No suggestions left to vote on.");
      }

      // Pick a random ID from the list
      const randomIndex = Math.floor(
        Math.random() * eligibleSuggestions.length
      );
      const randomSuggestionId = eligibleSuggestions[randomIndex].id;

      // Fetch the full suggestion details for the randomly selected ID
      const randomSuggestion = await prisma.themeSuggestion.findUnique({
        where: { id: randomSuggestionId },
      });

      res.json(randomSuggestion);
    } catch (error) {
      console.error("Error fetching random suggestion:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

router.delete(
  "/suggestion/:id",
  authenticateUser,
  checkJamParticipation,
  async function (req, res) {
    const suggestionId = parseInt(req.params.id);
    const username = res.locals.userSlug;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    // Check if the suggestion belongs to the user
    const suggestion = await prisma.themeSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion || suggestion.userId !== user.id) {
      return res
        .status(403)
        .send("Unauthorized: You cannot delete this suggestion.");
    }

    // Delete the suggestion
    try {
      await prisma.themeSuggestion.delete({
        where: { id: suggestionId },
      });

      res.send("Suggestion deleted successfully.");
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

router.put(
  "/suggestion/:id",
  authenticateUser,
  checkJamParticipation,
  async function (req, res) {
    const suggestionId = parseInt(req.params.id);
    const { suggestionText } = req.body;
    const username = res.locals.userSlug;

    if (!suggestionText) {
      return res.status(400).send("Suggestion text is required.");
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    // Check if the suggestion belongs to the user
    const suggestion = await prisma.themeSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion || suggestion.userId !== user.id) {
      return res
        .status(403)
        .send("Unauthorized: You cannot update this suggestion.");
    }

    // Update the suggestion
    try {
      const updatedSuggestion = await prisma.themeSuggestion.update({
        where: { id: suggestionId },
        data: { suggestion: suggestionText },
      });

      res.json(updatedSuggestion);
    } catch (error) {
      console.error("Error updating suggestion:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

router.post(
  "/suggestion",
  authenticateUser,
  checkJamParticipation,
  async function (req, res) {
    const { suggestionText } = req.body;

    if (!suggestionText) {
      return res.status(400).send("Suggestion text is required.");
    }

    // Extract username from authenticated user
    const username = res.locals.userSlug;
    console.log("Authenticated Username:", username);

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    // Get the current active jam
    const activeJam = await getCurrentActiveJam();

    if (!activeJam || !activeJam.futureJam) {
      return res.status(404).send("No active jam found.");
    }

    if (activeJam && activeJam.futureJam && activeJam.phase != "Suggestion") {
      return res.status(404).send("It's not suggestion phase.");
    }

    // Check if themePerUser is set and enforce the limit
    const themeLimit = activeJam.futureJam.themePerUser || Infinity; // Default to no limit if themePerUser is not set

    try {
      // Count existing suggestions by the user for this jam
      const userSuggestionsCount = await prisma.themeSuggestion.count({
        where: {
          userId: user.id,
          jamId: activeJam.futureJam.id,
        },
      });

      if (userSuggestionsCount >= themeLimit) {
        return res
          .status(403)
          .send(`You have reached your limit of ${themeLimit} suggestions.`);
      }

      // Create the suggestion in the database
      const newSuggestion = await prisma.themeSuggestion.create({
        data: {
          suggestion: suggestionText,
          userId: user.id,
          jamId: activeJam.futureJam.id,
        },
      });

      res.status(201).json(newSuggestion);
    } catch (error) {
      console.error("Error creating suggestion:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

/// SLAUGHTER VOTES

router.get(
  "/voteSlaughter",
  authenticateUser,
  checkJamParticipation,
  async (req, res) => {
    const username = res.locals.userSlug;

    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    // Get the current active jam
    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam) {
      return res.status(404).send("No active jam found.");
    }

    // Check phase
    if (activeJam.phase !== "Elimination") {
      return res.status(403).send("Elimination phase is not active");
    }

    try {
      // Fetch all votes for the current jam and include related theme suggestions
      const votes = await prisma.themeVote.findMany({
        where: {
          userId: user.id,
          jamId: activeJam.futureJam.id,
        },
        include: {
          themeSuggestion: true, // Include related theme suggestion details
        },
      });

      const formattedVotes = votes.map((vote) => ({
        id: vote.themeSuggestion.id,
        suggestion: vote.themeSuggestion.suggestion,
        slaughterScore: vote.slaughterScore,
        userId: vote.userId, // Include userId
      }));

      res.json(formattedVotes);
    } catch (error) {
      console.error("Error fetching voted themes:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

router.post(
  "/voteSlaughter",
  authenticateUser,
  checkJamParticipation,
  async (req, res) => {
    const username = res.locals.userSlug;
    const { suggestionId, voteType } = req.body;

    if (!suggestionId || !voteType) {
      return res.status(400).send("Missing required fields.");
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    // Get the current active jam
    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam) {
      return res.status(404).send("No active jam found.");
    }

    // Check phase
    if (activeJam.phase !== "Elimination") {
      return res.status(403).send("Elimination phase is not active");
    }

    try {
      // Check if the user already voted on this suggestion
      let existingVote = await prisma.themeVote.findFirst({
        where: {
          userId: user.id,
          jamId: activeJam.futureJam.id,
          themeSuggestionId: suggestionId,
        },
      });

      let slaughterScoreChange =
        voteType === "YES" ? +1 : voteType === "NO" ? -1 : 0;

      if (existingVote) {
        // Update existing vote and calculate score difference
        const scoreDifference =
          slaughterScoreChange - existingVote.slaughterScore;

        await prisma.themeVote.update({
          where: { id: existingVote.id },
          data: { slaughterScore: slaughterScoreChange },
        });
      } else {
        // Create a new vote record in ThemeVote table
        await prisma.themeVote.create({
          data: {
            slaughterScore: slaughterScoreChange,
            userId: user.id,
            jamId: activeJam.futureJam.id,
            themeSuggestionId: suggestionId, // Link vote to theme suggestion
          },
        });

      res.json({ message: "Vote recorded successfully." });
    } catch (error) {
      console.error("Error voting on suggestion:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

router.put(
  "/voteSlaughter/:id",
  authenticateUser,
  checkJamParticipation,
  async (req, res) => {
    const username = res.locals.userSlug;
    const { voteType } = req.body; // voteType can be "YES", "NO", or "SKIP"
    const voteId = parseInt(req.params.id);

    if (!voteType || isNaN(voteId)) {
      return res.status(400).send("Missing required fields.");
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    try {
      // Fetch existing vote
      const existingVote = await prisma.themeVote.findUnique({
        where: { id: voteId },
      });

      if (!existingVote || existingVote.userId !== user.id) {
        return res.status(403).send("Unauthorized to update this vote.");
      }

      // Determine new slaughterScore based on voteType
      let newSlaughterScore = 0;
      if (voteType === "YES") newSlaughterScore = +1;
      else if (voteType === "NO") newSlaughterScore = -1;

      // Calculate the difference between old and new slaughter scores
      const scoreDifference = newSlaughterScore - existingVote.slaughterScore;

      // Update ThemeVote record
      await prisma.themeVote.update({
        where: { id: voteId },
        data: { slaughterScore: newSlaughterScore },
      });
      
      res.json({ message: "Vote updated successfully." });
    } catch (error) {
      console.error("Error updating vote:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

// THEME VOTING

router.get("/top-themes", async (req, res) => {
  const activeJam = await getCurrentActiveJam();
  if (!activeJam || !activeJam.futureJam) {
    return res.status(404).send("No active jam found.");
  }

  // Check phase
  if (activeJam.phase == "Suggestion" || activeJam.phase == "Elimination") {
    return res.status(403).send("Voting phase is not active");
  }

  try {
    // Fetch top N themes without user votes
    // const topThemes = await prisma.themeSuggestion.findMany({
    //   where: { jamId: activeJam.futureJam.id },
    //   orderBy: { totalSlaughterScore: "desc" },
    //   take: activeJam.futureJam.themePerRound || 10,
    // });

    const topThemes = {};
    // TODO: Add new topthemes functionality

    res.json(topThemes);
  } catch (error) {
    console.error("Error fetching top themes:", error);
    res.status(500).send("Internal Server Error.");
  }
});

router.get(
  "/votes",
  authenticateUser,
  checkJamParticipation,
  async (req, res) => {
    const username = res.locals.userSlug;

    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam) {
      return res.status(404).send("No active jam found.");
    }

    try {
      const votes = await prisma.themeVote.findMany({
        where: {
          userId: user.id,
          jamId: activeJam.futureJam.id,
        },
        select: {
          themeSuggestionId: true,
          votingScore: true,
        },
      });

      res.json(votes);
    } catch (error) {
      console.error("Error fetching user votes:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post(
  "/vote",
  authenticateUser,
  checkJamParticipation,
  async (req, res) => {
    const username = res.locals.userSlug;
    const { suggestionId, votingScore } = req.body;

    if (!suggestionId || votingScore === undefined) {
      return res.status(400).send("Missing required fields.");
    }

    // Add vote value validation
    if (votingScore < -1 || votingScore > 1) {
      return res.status(400).send("Invalid voting score");
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { slug: username },
    });

    if (!user) {
      return res.status(401).send("Unauthorized: User not found.");
    }

    // Get the current active jam
    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam) {
      return res.status(404).send("No active jam found.");
    }

    try {
      // Check if the user already voted on this suggestion
      let existingVote = await prisma.themeVote.findFirst({
        where: {
          userId: user.id,
          jamId: activeJam.futureJam.id,
          themeSuggestionId: suggestionId,
        },
      });

      if (existingVote) {
        // Calculate score difference
        const scoreDifference = votingScore - existingVote.votingScore;

        // Use transactions for critical operations
        await prisma.$transaction(async (tx) => {
          // Update vote
          await tx.themeVote.update({
            where: { id: existingVote.id },
            data: { votingScore },
          });

          // Update total score
          await tx.themeSuggestion.update({
            where: { id: suggestionId },
            data: {
              totalVotingScore: {
                increment: scoreDifference,
              },
            },
          });
        });
      } else {
        // Create a new vote record in ThemeVote table
        await prisma.themeVote.create({
          data: {
            votingScore,
            userId: user.id,
            jamId: activeJam.futureJam.id,
            themeSuggestionId: suggestionId,
          },
        });

        // Update totalVotingScore in ThemeSuggestion table
        await prisma.themeSuggestion.update({
          where: { id: suggestionId },
          data: {
            totalVotingScore: {
              increment: votingScore,
            },
          },
        });
      }

      res.json({ message: "Vote recorded successfully." });
    } catch (error) {
      console.error("Error updating voting scores:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
);

export default router;
