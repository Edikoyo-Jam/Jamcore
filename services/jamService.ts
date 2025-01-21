// services/jamService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCurrentActiveJam = async () => {
  const jams = await prisma.jam.findMany({
    where: { isActive: true },
  });
  
  const now = new Date();


  console.log(jams.length);

  
  for (const jam of jams) {
    const startOfSuggestionsTime = new Date(jam.startTime - (jam.suggestionHours * 60 * 60 * 1000) - (jam.slaughterHours * 60 * 60 * 1000) - (jam.votingHours * 60 * 60 * 1000));
    const suggestionEnd = new Date(startOfSuggestionsTime.getTime() + jam.suggestionHours * 60 * 60 * 1000);
    const slaughterEnd = new Date(suggestionEnd.getTime() + jam.slaughterHours * 60 * 60 * 1000);
    const votingEnd = new Date(slaughterEnd.getTime() + jam.votingHours * 60 * 60 * 1000);
    const jammingEnd = new Date(votingEnd.getTime() + jam.jammingHours * 60 * 60 * 1000);
    const ratingEnd = new Date(jammingEnd.getTime() + jam.ratingHours * 60 * 60 * 1000);

    console.log(startOfSuggestionsTime);
    console.log(suggestionEnd);
    console.log(votingEnd);
    console.log(jammingEnd);
    console.log(ratingEnd);
    console.log("=======");

    
    console.log(now);

    if (now >= startOfSuggestionsTime && now < suggestionEnd) return { phase: "Suggestion", jam };
    if (now >= suggestionEnd && now < slaughterEnd) return { phase: "Survival", jam };
    if (now >= slaughterEnd && now < votingEnd) return { phase: "Voting", jam };
    if (now >= votingEnd && now < jammingEnd) return { phase: "Jamming", jam };
    if (now >= jammingEnd && now < ratingEnd) return { phase: "Rating", jam };
  }

  return { phase: "No Active Jams", };
  
};