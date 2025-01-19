import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import v1 from "./routes/v1/v1.js";

const port = 3005;

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://d2jam.com"
        : `http://localhost:${process.env.FRONT_DEV_PORT || 3000}`,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", v1);

app.listen(port, () => {
  console.log(`Jamcore listening on port ${port}`);
});
