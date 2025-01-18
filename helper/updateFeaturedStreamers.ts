import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateFeaturedStreamers() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  try {
    // Step 1: Get access token from Twitch API
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      },
    });
    const accessToken = tokenResponse.data.access_token;

    // Step 2: Fetch streams from Twitch API
    const gameId = '1469308723'; // Replace with your desired game ID
    const response = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        first: 100,
        game_id: gameId,
      },
    });

    const streams = response.data.data || [];

    // Step 3: Filter streams by desired tags
    const desiredTags = ['LudumDare', 'gamejam', 'gamedev']; // Replace with your desired tags
    const filteredStreams = streams.filter((stream) => {
  if (!stream.tags) return false; // Skip streams without tags
  return stream.tags.some((tag) => desiredTags.includes(tag));
});

    console.log('Fetched streams:', streams); // Log all fetched streams
    console.log('Filtered streams:', filteredStreams); // Log filtered 

    // Step 4: Update database with filtered streams
    await prisma.featuredStreamer.deleteMany(); // Clear existing records

    console.log('Inserting new featured streams into database...');
    for (const stream of filteredStreams.slice(0, 5)) {
       console.log('Inserting stream:', stream.user_name);
      await prisma.featuredStreamer.create({
        data: {
          userName: stream.user_name,
          thumbnailUrl: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
          streamTitle: stream.title,
          streamTags: stream.tag_ids || [],
        },
      });
    }

    console.log('Featured streamers updated successfully!');
  } catch (error) {
    console.error('Error updating featured streamers:', error.message);
  }
}