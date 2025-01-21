import { Request, Response } from "express";
import { getCurrentActiveJam } from "../services/jamService";

export const getActiveJam = async (req: Request, res: Response) => {
  console.log("getting active jam");
  try {
    const activeJam = await getCurrentActiveJam();
    if (!activeJam) {
      return res.status(404).json({ message: "No active jams found" });
    }
    res.send(activeJam); // Controller sends the response here
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};