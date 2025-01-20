import express from "express";

var router = express.Router();

router.post("/", function (req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });
  res.status(200);
  res.send({ message: "Logged out successfully" });
});

export default router;
