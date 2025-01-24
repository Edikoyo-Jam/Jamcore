import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
var router = express.Router();

router.post("/", async function (req, res) {
  const { username, targetname, mod = false, admin = false } = req.body;

  if (!username || !targetname) {
    res.status(400).send("Invalid request body.");
    return;
  }

  const authHeader = req.headers["authorization"];
  const refreshToken = req.cookies["refreshToken"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken || !refreshToken || !process.env.TOKEN_SECRET) {
    res.status(401).send("Unauthorized.");
    return;
  }

  try {
    jwt.verify(accessToken, process.env.TOKEN_SECRET);
  } catch {
    try {
      jwt.verify(refreshToken, process.env.TOKEN_SECRET);
      const newAccessToken = jwt.sign(
        { user: username },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        })
        .header("Authorization", newAccessToken);
    } catch {
      res.status(400).send("Invalid token.");
      return;
    }
  }

  try {
    const [user, target] = await Promise.all([
      prisma.user.findUnique({
        where: { slug: username },
      }),
      prisma.user.findUnique({
        where: { slug: targetname },
      }),
    ]);

    if (!user || !target) {
      res.status(404).send("User or target not found.");
      return;
    }

    if (!user.admin) {
      res.status(403).send("You are not authorized to perform this action.");
      return;
    }

    if (admin) {
      if (target.admin) {
        res.status(400).send("Target user is already an admin.");
        return;
      }

      await prisma.user.update({
        where: { slug: targetname },
        data: { admin: true, mod: true },
      });

      res.status(200).send("Target user has been promoted to admin.");
      return;
    }

    if (!admin) {
      if (!target.admin) {
        await prisma.user.update({
          where: { slug: targetname },
          data: { mod: mod },
        });

        res.status(200).send("Mod status updated.");
        return;
      }

      if (target.createdAt <= user.createdAt) {
        res
          .status(403)
          .send(
            "You cannot demote admins who were added before or at the same time as you."
          );
        return;
      }

      await prisma.user.update({
        where: { slug: targetname },
        data: { admin: false, mod: mod },
      });

      res.status(200).send("Target admin has been demoted.");
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

export default router;
