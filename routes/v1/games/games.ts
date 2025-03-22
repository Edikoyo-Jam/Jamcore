import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import getJam from "@middleware/getJam";

const prisma = new PrismaClient();
var router = express.Router();

router.put("/:gameSlug", getJam, async function (req, res) {
  const { gameSlug } = req.params;
  const {
    name,
    slug,
    description,
    thumbnail,
    downloadLinks,
    category,
    ratingCategories,
    published,
    themeJustification,
  } = req.body;

  if (!name || !category) {
    res.status(400).send("Name is required.");
    return;
  }

  if (res.locals.jamPhase != "Rating" && res.locals.jamPhase != "Jamming") {
    res
      .status(400)
      .send("Can't edit game outside of jamming and rating period.");
    return;
  }

  try {
    // Find the existing game
    const existingGame = await prisma.game.findUnique({
      where: { slug: gameSlug },
      include: {
        ratingCategories: true,
      },
    });

    if (!existingGame) {
      res.status(404).send("Game not found.");
      return;
    }

    if (res.locals.jamPhase == "Rating" && existingGame.category != category) {
      res.status(400).send("Can't update category outside of jamming period.");
      return;
    }

    const currentRatingCategories = existingGame.ratingCategories;
    const disconnectRatingCategories = currentRatingCategories.filter(
      (category) => !ratingCategories.includes(category.id)
    );
    const newRatingCategories = ratingCategories.filter(
      (category: number) =>
        currentRatingCategories.filter(
          (ratingCategory) => ratingCategory.id == category
        ).length == 0
    );

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
        ratingCategories: {
          disconnect: disconnectRatingCategories.map((categry) => ({
            id: categry.id,
          })),
          connect: newRatingCategories.map((category: number) => ({
            id: category,
          })),
        },
        category,
        published,
        themeJustification,
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
      team: {
        include: {
          users: true,
        },
      },
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
    where: {
      published: true,
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
