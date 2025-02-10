import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import path from "path";

const router = Router();

/**
 * Route to get an image
 */
router.get(
  "/:filename",
  rateLimit(),

  (req, res) => {
    const { filename } = req.params;

    const imagePath = path.join(
      import.meta.dirname,
      "..",
      "..",
      "..",
      "public",
      "images",
      `${filename}`
    );

    res.sendFile(imagePath, (err) => {
      if (err) {
        res.status(404).send("Image not found");
      }
    });
  }
);

export default router;
