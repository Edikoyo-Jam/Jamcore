import axios from "axios";
import { PrismaClient } from "@prisma/client";
import db from "./db";

const prisma = new PrismaClient();

export async function updateFeaturedStreamers() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  try {
    // Step 1: Get access token from Twitch API
    const tokenResponse = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    // Step 2: Fetch streams from Twitch API
    const gameId = "1469308723"; // Replace with your desired game ID
    const response = await axios.get("https://api.twitch.tv/helix/streams", {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        first: 100,
        game_id: gameId,
        type: "live",
      },
    });

    const streams = response.data.data || [];

    // Step 3: Filter streams by desired tags
    const priorityTags = ["d2jam"];
    const desiredTags = [
      "d2jam",
      "ludumdare",
      "gamejam",
      "gamedev",
      "gamedevelopment",
    ];
    const streamers = await db.user.findMany({
      where: {
        twitch: {
          not: null,
        },
      },
    });
    const streamerNames = streamers.map((streamer) =>
      streamer.twitch?.toLowerCase()
    );

    const filteredStreams = streams.filter((stream) => {
      if (!stream.tags) return false; // Skip streams without tags
      if (stream.language !== "en") return false; // Skip non-English streams
      return stream.tags.some((tag) => desiredTags.includes(tag.toLowerCase()));
    });

    const priorityStreams = filteredStreams.filter((stream) =>
      stream.tags.some((tag) => priorityTags.includes(tag.toLowerCase()))
    );

    const streamerStreams = filteredStreams
      .filter((stream) =>
        stream.tags.every((tag) => !priorityTags.includes(tag.toLowerCase()))
      )
      .filter((stream) =>
        streamerNames.includes(stream.user_name.toLowerCase())
      );

    const nonPriorityStreams = filteredStreams
      .filter((stream) =>
        stream.tags.every((tag) => !priorityTags.includes(tag.toLowerCase()))
      )
      .filter(
        (stream) => !streamerNames.includes(stream.user_name.toLowerCase())
      )
      .slice(0, 3);

    // Step 4: Update database with filtered streams
    await prisma.featuredStreamer.deleteMany(); // Clear existing records

    const finalStreams = [
      ...priorityStreams,
      ...streamerStreams,
      ...nonPriorityStreams,
    ];

    console.log("Inserting new featured streams into database...");
    for (const stream of finalStreams) {
      console.log(stream);
      console.log("Inserting stream:", stream.user_name);
      await prisma.featuredStreamer.create({
        data: {
          userName: stream.user_name,
          thumbnailUrl: stream.thumbnail_url
            .replace("{width}", "480")
            .replace("{height}", "270"),
          streamTitle: stream.title,
          streamTags: stream.tags
            ? ([
                ...new Set(stream.tags.map((tag) => tag.toLowerCase())),
              ] as string[])
            : [],
          viewerCount: stream.viewer_count,
        },
      });
    }

    console.log("Featured streamers updated successfully!");
  } catch (error) {
    console.error("Error updating featured streamers:", error.message);
  }
}
