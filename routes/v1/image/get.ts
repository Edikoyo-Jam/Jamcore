import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import path from "path";

const router = Router();
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Route to get an image
 */
router.get(
  "/:filename",
  rateLimit(9999),

  (req, res) => {
    const { filename } = req.params;

    const imagePath = path.join(
      __dirname,
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
