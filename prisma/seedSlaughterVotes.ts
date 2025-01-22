import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding random slaughter votes...");

  // Fetch all users
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    throw new Error("No users found in the database.");
  }

  // Fetch all theme suggestions
  const themes = await prisma.themeSuggestion.findMany();
  if (themes.length === 0) {
    throw new Error("No theme suggestions found in the database.");
  }

  const votes = [];
  const themeUpdates = {};

  // Generate random slaughter votes for each user on each theme
  for (const user of users) {
    for (const theme of themes) {
      // Randomly generate a slaughter vote (-1, 0, or +1)
      const slaughterScore = faker.helpers.arrayElement([-1, 0, +1]);

      // Skip adding a vote if the score is 0 (no vote)
      if (slaughterScore !== 0) {
        votes.push({
          userId: user.id,
          jamId: theme.jamId,
          themeSuggestionId: theme.id,
          slaughterScore,
        });

        // Track totalSlaughterScore updates for each theme
        if (!themeUpdates[theme.id]) {
          themeUpdates[theme.id] = 0;
        }
        themeUpdates[theme.id] += slaughterScore;
      }
    }
  }

  // Insert votes into the ThemeVote table
  console.log(`Creating ${votes.length} slaughter votes...`);
  await prisma.themeVote.createMany({
    data: votes,
    skipDuplicates: true, // Avoid duplicates if re-seeding
  });

  // Update totalSlaughterScore for each theme
  console.log("Updating totalSlaughterScores...");
  for (const [themeId, scoreChange] of Object.entries(themeUpdates)) {
    await prisma.themeSuggestion.update({
      where: { id: parseInt(themeId) },
      data: {
        totalSlaughterScore: {
          increment: scoreChange,
        },
      },
    });
  }

  console.log("Seeding random slaughter votes completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });