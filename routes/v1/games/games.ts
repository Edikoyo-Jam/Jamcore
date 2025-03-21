import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { getCurrentActiveJam } from "../../../services/jamService";

const prisma = new PrismaClient();
var router = express.Router();

router.post("/create", async function (req, res) {
  const { name, slug, description, thumbnail, downloadLinks, userSlug } =
    req.body;

  if (!name || !slug || !userSlug) {
    // Validate that userSlug is provided
    res.status(400).send("Missing required fields or user not logged in.");
    return;
  }

  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { slug: userSlug },
    });

    if (!user) {
      res.status(401).send("User not found.");
      return;
    }

    // Get current active jam
    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.futureJam) {
      res.status(404).send("No active jam found.");
      return;
    }

    // Create game with download links and contributors
    const game = await prisma.game.create({
      data: {
        name,
        slug,
        description,
        thumbnail,
        jamId: activeJam.futureJam.id,
        downloadLinks: {
          create: downloadLinks.map(
            (link: { url: string; platform: string }) => ({
              url: link.url,
              platform: link.platform,
            })
          ),
        },
        teamId: 1,
        category: "ODA",
      },
      include: {
        downloadLinks: true,
      },
    });

    res.status(201).json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).send("Internal server error.");
  }
});

router.put("/:gameSlug", async function (req, res) {
  const { gameSlug } = req.params;
  const { name, slug, description, thumbnail, downloadLinks } = req.body;

  if (!name || !description) {
    res.status(400).send("Name and description are required.");
    return;
  }

  try {
    // Find the existing game
    const existingGame = await prisma.game.findUnique({
      where: { slug: gameSlug },
    });

    if (!existingGame) {
      res.status(404).send("Game not found.");
      return;
    }

    // Update the game
    const updatedGame = await prisma.game.update({
      where: { slug: gameSlug },
      data: {
        name,
        slug,
        description,
        thumbnail,
        downloadLinks: {
          deleteMany: {}, // Remove all existing download links
          create: downloadLinks.map(
            (link: { url: string; platform: string }) => ({
              url: link.url,
              platform: link.platform,
            })
          ),
        },
      },
      include: {
        downloadLinks: true,
      },
    });

    res.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    res.status(500).send("Internal server error.");
  }
});

router.get("/:gameSlug", async function (req, res) {
  const { gameSlug } = req.params;

  const game = await prisma.game.findUnique({
    where: { slug: gameSlug },
    include: {
      downloadLinks: true,
    },
  });

  if (!game) {
    res.status(404).send("Game not found");
    return;
  }

  res.json(game);
});

router.get("/", async function (req: Request, res: Response) {
  const { sort } = req.query;
  let orderBy = {};

  switch (sort) {
    case "oldest":
      orderBy = { id: "asc" };
      break;
    case "newest":
      orderBy = { id: "desc" };
      break;
    case "top":
      orderBy = { scores: { _count: "desc" } };
      break;
    case "bottom":
      orderBy = { scores: { _count: "asc" } };
      break;
    default:
      orderBy = { id: "desc" };
      break;
  }

  const game = await prisma.game.findMany({
    include: {
      jam: true,
    },
    orderBy,
  });

  if (!game) {
    res.status(404).send("No Games were found");
    return;
  }

  res.json(game);
});

export default router;
