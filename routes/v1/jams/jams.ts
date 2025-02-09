import express from "express";
import { PrismaClient } from "@prisma/client";
import { getActiveJam } from "../../../controllers/jamController";
import {
  postSuggestion,
  getSuggestions,
} from "../../../controllers/suggestionController";
import { getCurrentActiveJam } from "../../../services/jamService";
import authenticateUser from "../../../middleware/authUser";

const prisma = new PrismaClient();
var router = express.Router();

router.get("/", async function (req, res) {
  const jams = await prisma.jam.findMany({
    take: 10,
    orderBy: {
      id: "desc",
    },
  });

  res.send(jams);
});

router.get("/active", async function (req, res) {
  try {
    await getActiveJam(req, res); // Pass req and res directly to the controller
  } catch (error) {
    console.error("Error fetching the active jam", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/participation", authenticateUser, async function (req, res) {
  const username = req.user.username;

  try {
    // Get active jam
    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam) {
      return res.status(404).send("No active jam found.");
    }

    // Check if user has joined this jam
    const hasJoined = await prisma.jam.findFirst({
      where: {
        id: activeJam.futureJam.id,
        users: {
          some: {
            slug: username,
          },
        },
      },
    });

    if (hasJoined) {
      res.status(200).json({ hasJoined: true });
    } else {
      res.status(403).json({ hasJoined: false });
    }
  } catch (error) {
    console.error("Error checking jam participation:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
