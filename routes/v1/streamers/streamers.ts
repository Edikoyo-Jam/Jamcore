import express from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
var router = express.Router();

router.get('/get', async (req, res) => {
  try {
    const featuredStreamers = await prisma.featuredStreamer.findMany();
    res.json(featuredStreamers);
  } catch (error) {
    console.error('Error fetching featured streamers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



export default router;
