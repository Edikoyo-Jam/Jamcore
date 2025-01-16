import express from "express";
import cors from "cors";

import v1 from "./routes/v1/v1.js";

const port = 3005;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", v1);

app.listen(port, () => {
  console.log(`Jamcore listening on port ${port}`);
});
