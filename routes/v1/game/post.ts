import db from "@helper/db";
import assertJamPhase from "@middleware/assertJamPhase";
import assertTargetTeamDoesNotHaveGame from "@middleware/assertTargetTeamDoesNotHaveGame";
import assertUserIsInTargetTeam from "@middleware/assertUserIsInTargetTeam";
import authUser from "@middleware/authUser";
import getJam from "@middleware/getJam";
import getTargetTeam from "@middleware/getTargetTeam";
import getUser from "@middleware/getUser";
import rateLimit from "@middleware/rateLimit";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

router.post(
  "/",
  rateLimit(),

  body("name").isString().withMessage({
    message: "Please enter a valid name",
  }),
  body("slug").isString().withMessage({
    message: "Please enter a valid slug",
  }),
  body("category").isString().isIn(["ODA", "REGULAR"]).withMessage({
    message: "Please enter a valid category",
  }),
  body("ratingCategories").isArray().withMessage({
    message: "Please enter a valid rating category array",
  }),

  authUser,
  getUser,
  getJam,
  getTargetTeam,
  assertJamPhase("Jamming"),
  assertUserIsInTargetTeam,
  assertTargetTeamDoesNotHaveGame,

  async function (req, res) {
    const {
      name,
      slug,
      description,
      thumbnail,
      downloadLinks,
      category,
      ratingCategories,
      published,
    } = req.body;

    try {
      const game = await db.game.create({
        data: {
          name,
          slug,
          description,
          thumbnail,
          jamId: res.locals.jam.id,
          downloadLinks: {
            create: downloadLinks.map(
              (link: { url: string; platform: string }) => ({
                url: link.url,
                platform: link.platform,
              })
            ),
          },
          ratingCategories: {
            connect: ratingCategories.map((id: number) => ({
              id: id,
            })),
          },
          teamId: res.locals.targetTeam.id,
          category,
          published,
        },
        include: {
          downloadLinks: true,
        },
      });

      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).send("Internal server error.");
    }
  }
);

export default router;
