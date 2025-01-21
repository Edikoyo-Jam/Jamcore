import express from "express";
import { PrismaClient } from "@prisma/client";
import { getCurrentActiveJam } from "../../../services/jamService";
import { authenticateUser} from "../../../middleware/authMiddleware";

const prisma = new PrismaClient();
const router = express.Router();

// Route to retrieve suggestions for the current jam
router.get("/suggestions", async function (req, res) {
  try {
    await getSuggestions(req, res);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Route to submit a new suggestion
router.post("/suggestions", async function (req, res) {

  const { suggestionText } = req.body;

  // Validate input
  if (!suggestionText) {
    res.status(400).send("Suggestion text is required.");
    return;
  }

  // Authentication: Extract tokens
  const authHeader = req.headers["authorization"];
  const refreshToken = req.cookies["refreshToken"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken || !refreshToken) {
    res.status(401).send("Unauthorized: Missing tokens.");
    return;
  }

  if (!process.env.TOKEN_SECRET) {
    res.status(500).send("Server Error: Missing TOKEN_SECRET.");
    return;
  }

  let username;
  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
    username = decoded.user; // Assuming the token contains a `user` field
  } catch (error) {
    // If access token is invalid, try refreshing it
    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
      username = decodedRefresh.user;

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
    } catch (error) {
      res.status(401).send("Unauthorized: Invalid tokens.");
      return;
    }
  }

  // Find the user in the database
  const user = await prisma.user.findUnique({
    where: { slug: username },
  });

  if (!user) {
    res.status(401).send("Unauthorized: User not found.");
    return;
  }

  // Get the current active jam
  const activeJam = await getCurrentActiveJam();
  if (!activeJam || !activeJam.jam) {
    res.status(404).send("No active jam found.");
    return;
  }

  // Create the suggestion in the database
  try {
    const newSuggestion = await prisma.themeSuggestion.create({
      data: {
        suggestion: suggestionText,
        userId: user.id,
        jamId: activeJam.jam.id,
        totalSlaughterScore: 0,
        totalVotingScore: 0,
      },
    });

    res.status(201).json(newSuggestion);
  } catch (error) {
    console.error("Error creating suggestion:", error);
    res.status(500).send("Internal Server Error.");
  }
});

export default router;