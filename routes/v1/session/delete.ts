import express from "express";

var router = express.Router();

// TODO: Clean up

router.delete("/", function (req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });
  res.status(200);
  res.send({ message: "Logged out successfully" });
});

export default router;
