import express from "express";
import { PrismaClient } from "@prisma/client";
import { getActiveJam } from "../../../controllers/jamController";
import { postSuggestion, getSuggestions } from "../../../controllers/suggestionController";
import jwt from "jsonwebtoken";
import { getCurrentActiveJam } from "../../../services/jamService";

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



export default router;
