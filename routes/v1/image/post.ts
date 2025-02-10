import { Router } from "express";
import rateLimit from "@middleware/rateLimit";
import authUser from "@middleware/authUser";
import images from "@helper/images";

const router = Router();

/**
 * Route to upload an image to the server
 * Requires Authentication (to prevent bots)
 */
router.post(
  "/",
  rateLimit(),

  authUser,

  (req, res, next) => {
    images.single("upload")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(500).send({ message: "File upload error" });
      }
      next();
    });
  },

  (req, res) => {
    res.status(200).send({
      message: "Image uploaded",
      data: `${
        process.env.NODE_ENV === "production"
          ? "https://d2jam.com"
          : `http://localhost:${process.env.PORT || 3005}`
      }/api/v1/image/${req.file?.filename}`,
    });
  }
);

export default router;
