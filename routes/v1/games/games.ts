import express from "express";
import { PrismaClient } from "@prisma/client";
import { getCurrentActiveJam } from "../../../services/jamService";


const prisma = new PrismaClient();
var router = express.Router();



router.post("/create", async function (req, res) {
    const { 
      name, 
      slug, 
      description, 
      thumbnail, 
      downloadLinks,
      userSlug,
      contributors 
    } = req.body;
  
    if (!name || !slug || !userSlug) { // Validate that userSlug is provided
      return res.status(400).send("Missing required fields or user not logged in.");
    }
  
    try {
      // Get current user
      const user = await prisma.user.findUnique({
        where: { slug: userSlug },
      });
  
      if (!user) {
        return res.status(401).send("User not found.");
      }
  
      // Get current active jam
      const activeJam = await getCurrentActiveJam();
      if (!activeJam || !activeJam.futureJam) {
        return res.status(404).send("No active jam found.");
      }
  
      // Create game with download links and contributors
      const game = await prisma.game.create({
        data: {
          name,
          slug,
          description,
          thumbnail,
          authorId: user.id,
          jamId: activeJam.futureJam.id,
          downloadLinks: {
            create: downloadLinks.map((link: { url: string; platform: string }) => ({
              url: link.url,
              platform: link.platform,
            })),
          },
          contributors: {
            connect: contributors.map((id: number) => ({ id })),
          },
        },
        include: {
          downloadLinks: true,
          contributors: true,
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
    const { name, slug, description, thumbnail, downloadLinks, contributors } = req.body;
  
    if (!name || !description) {
      return res.status(400).send("Name and description are required.");
    }
  
    try {
      // Find the existing game
      const existingGame = await prisma.game.findUnique({
        where: { slug: gameSlug },
        include: { contributors: true },
      });
  
      if (!existingGame) {
        return res.status(404).send("Game not found.");
      }
  
      // Determine which contributors to add and which to remove
      const existingContributorIds = existingGame.contributors.map((c) => c.id);
      const newContributorIds = contributors;
  
      const contributorsToAdd = newContributorIds.filter(
        (id) => !existingContributorIds.includes(id)
      );
      const contributorsToRemove = existingContributorIds.filter(
        (id) => !newContributorIds.includes(id)
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
            create: downloadLinks.map((link: { url: string; platform: string }) => ({
              url: link.url,
              platform: link.platform,
            })),
          },
          contributors: {
            connect: contributorsToAdd.map((id) => ({ id })),
            disconnect: contributorsToRemove.map((id) => ({ id })),
          },
        },
        include: {
          downloadLinks: true,
          contributors: true,
        },
      });
  
      // Update contributedGames for added contributors
      await Promise.all(
        contributorsToAdd.map((id) =>
          prisma.user.update({
            where: { id },
            data: {
              contributedGames: {
                connect: { id: updatedGame.id },
              },
            },
          })
        )
      );
  
      // Update contributedGames for removed contributors
      await Promise.all(
        contributorsToRemove.map((id) =>
          prisma.user.update({
            where: { id },
            data: {
              contributedGames: {
                disconnect: { id: updatedGame.id },
              },
            },
          })
        )
      );
  
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
        author: true,
        contributors: true,
      }
    });
    
    if (!game) {
      return res.status(404).send("Game not found");
    }
    
    res.json(game);
  });

  router.post("/:gameSlug/contributors", async function (req, res) {
    const { gameSlug } = req.params;
    const { contributorIds } = req.body; // Array of contributor IDs
  
    if (!contributorIds || !Array.isArray(contributorIds)) {
      return res.status(400).send("Invalid contributor IDs.");
    }
  
    try {
      // Find the game by slug
      const game = await prisma.game.findUnique({
        where: { slug: gameSlug },
      });
  
      if (!game) {
        return res.status(404).send("Game not found.");
      }
  
      // Update contributors for the game
      const updatedGame = await prisma.game.update({
        where: { slug: gameSlug },
        data: {
          contributors: {
            connect: contributorIds.map((id: number) => ({ id })),
          },
        },
        include: {
          contributors: true,
        },
      });
  
      // Update contributedGames for each user
      await Promise.all(
        contributorIds.map((id: number) =>
          prisma.user.update({
            where: { id },
            data: {
              contributedGames: {
                connect: { id: game.id },
              },
            },
          })
        )
      );
  
      res.json(updatedGame);
    } catch (error) {
      console.error("Error adding contributors:", error);
      res.status(500).send("Internal server error.");
    }
  });

  router.delete("/:gameSlug/contributors", async function (req, res) {
    const { gameSlug } = req.params;
    const { contributorIds } = req.body; // Array of contributor IDs
  
    if (!contributorIds || !Array.isArray(contributorIds)) {
      return res.status(400).send("Invalid contributor IDs.");
    }
  
    try {
      // Find the game by slug
      const game = await prisma.game.findUnique({
        where: { slug: gameSlug },
      });
  
      if (!game) {
        return res.status(404).send("Game not found.");
      }
  
      // Update contributors for the game
      const updatedGame = await prisma.game.update({
        where: { slug: gameSlug },
        data: {
          contributors: {
            disconnect: contributorIds.map((id: number) => ({ id })),
          },
        },
        include: {
          contributors: true,
        },
      });
  
      // Update contributedGames for each user
      await Promise.all(
        contributorIds.map((id: number) =>
          prisma.user.update({
            where: { id },
            data: {
              contributedGames: {
                disconnect: { id: game.id },
              },
            },
          })
        )
      );
  
      res.json(updatedGame);
    } catch (error) {
      console.error("Error removing contributors:", error);
      res.status(500).send("Internal server error.");
    }
  });

  

export default router;
