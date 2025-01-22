// services/jamService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCurrentActiveJam = async () => {
  const jams = await prisma.jam.findMany({
    where: { isActive: true },
  });
  
  // Get current time in UTC
  const now = new Date().toISOString();
  console.log("Current UTC time:", now);
  console.log("Number of active jams:", jams.length);

  for (const jam of jams) {
    // Convert jam.startTime to UTC if it isn't already
    const startTimeUTC = new Date(jam.startTime).toISOString();
    
    // Calculate all phase times in UTC
    const startOfSuggestionsTime = new Date(
      new Date(startTimeUTC).getTime() - 
      (jam.suggestionHours * 60 * 60 * 1000) - 
      (jam.slaughterHours * 60 * 60 * 1000) - 
      (jam.votingHours * 60 * 60 * 1000)
    ).toISOString();

    const suggestionEnd = new Date(
      new Date(startOfSuggestionsTime).getTime() + 
      (jam.suggestionHours * 60 * 60 * 1000)
    ).toISOString();

    const slaughterEnd = new Date(
      new Date(suggestionEnd).getTime() + 
      (jam.slaughterHours * 60 * 60 * 1000)
    ).toISOString();

    const votingEnd = new Date(
      new Date(slaughterEnd).getTime() + 
      (jam.votingHours * 60 * 60 * 1000)
    ).toISOString();

    const jammingEnd = new Date(
      new Date(votingEnd).getTime() + 
      (jam.jammingHours * 60 * 60 * 1000)
    ).toISOString();

    const ratingEnd = new Date(
      new Date(jammingEnd).getTime() + 
      (jam.ratingHours * 60 * 60 * 1000)
    ).toISOString();

    /*
    console.log("Phase times (UTC):");
    console.log("Start of Suggestions:", startOfSuggestionsTime);
    console.log("End of Suggestions:", suggestionEnd);
    console.log("End of Slaughter:", slaughterEnd);
    console.log("End of Voting:", votingEnd);
    console.log("End of Jamming:", jammingEnd);
    console.log("End of Rating:", ratingEnd);
    console.log("=======");
    */

    if (now < startOfSuggestionsTime) return { phase: "Upcoming", jam };
    if (now >= startOfSuggestionsTime && now < suggestionEnd) return { phase: "Suggestion", jam };
    if (now >= suggestionEnd && now < slaughterEnd) return { phase: "Survival", jam };
    if (now >= slaughterEnd && now < votingEnd) return { phase: "Voting", jam };
    if (now >= votingEnd && now < jammingEnd) return { phase: "Jamming", jam };
    if (now >= jammingEnd && now < ratingEnd) return { phase: "Rating", jam };
  }

  return { phase: "No Active Jams" };
};