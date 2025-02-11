import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve(__dirname, "..", "public", "images");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, uuidv4() + "." + extension);
  },
});

const images = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 8 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", // JPEG images
      "image/png", // PNG images
      "image/gif", // GIF images
      "image/webp", // WebP images
      "image/svg+xml", // SVG images
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Invalid file type");
      return cb(error);
    }

    cb(null, true);
  },
});

export default images;
