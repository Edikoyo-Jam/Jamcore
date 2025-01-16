import express from "express";
import jwt from "jsonwebtoken";

var router = express.Router();

router.get("/", async function (req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.status(401);
    res.send();
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500);
    res.send();
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err: any, user: any) => {
    if (err) return res.status(403);

    res.send("ok");
  });
});

export default router;
