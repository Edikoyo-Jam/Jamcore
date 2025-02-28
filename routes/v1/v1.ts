import express from "express";

import { readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import posts from "./posts/get.js";

var router = express.Router();

function loadRoutes(dir: string, routePath: string) {
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      loadRoutes(
        path.join(file.path, file.name),
        path.join(routePath, file.name)
      );
    } else {
      if (file.name == "v1.ts" || file.name == "index.ts") {
        continue;
      }

      import(pathToFileURL(path.join(file.path, file.name)).href).then(
        (module) => {
          if (!module.default) {
            console.log(
              `Route ${path.join(routePath, file.name)} has no default export`
            );
            return;
          }

          const method = file.name.replace(".ts", "").toLowerCase();

          if (!["get", "post", "put", "delete"].includes(method)) {
            console.log(
              `Route ${path.join(
                routePath,
                file.name
              )} is not a rest api method`
            );
            return;
          }

          router.use(routePath.replace("\\", "/"), module.default);
          console.log(`Loaded route: ${path.join(routePath, file.name)}`);
        }
      );
    }
  }
}

loadRoutes(__dirname, "/");

export default router;
