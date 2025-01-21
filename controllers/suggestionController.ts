import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getCurrentActiveJam } from "../services/jamService";

const prisma = new PrismaClient();

export const getSuggestions = async (req: Request, res: Response) => {
  try {
    // Get the current active jam
    const activeJam = await getCurrentActiveJam();
    if (!activeJam || !activeJam.jam) {
      return res.status(404).json({ message: "No active jam found" });
    }

    // Fetch all suggestions for the current jam
    const suggestions = await prisma.themeSuggestion.findMany({
      where: { jamId: activeJam.jam.id }
    });

    return res.json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const postSuggestion = async (req: Request, res: Response) => {
    try {
      const { suggestionText, userId } = req.body;
  
      // Validate input
      if (!suggestionText || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Get the current active jam
      const activeJam = await getCurrentActiveJam();
      if (!activeJam || !activeJam.jam) {
        return res.status(404).json({ message: "No active jam found" });
      }
  
      // Create a new suggestion in the database
      const newSuggestion = await prisma.themeSuggestion.create({
        data: {
          suggestion: suggestionText,
          userId,
          jamId: activeJam.jam.id,
          totalSlaughterScore: 0,
          totalVotingScore: 0,
        },
      });
  
      return res.status(201).json(newSuggestion);
    } catch (error) {
      console.error("Error posting suggestion:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };