import { spotifyClient } from "../classes/spotifyAPI";

export default async function (string: string, channelID: number, parts: string[]): Promise<returnData | void> {
  if (string.startsWith("spotify:")) {
    // const id = string.substring(14, 39);
    const URI = string;
    const id = URI.substring(14, 39);

    return { URI, id };
  } else if (string.startsWith("https://open.spotify.com/track")) {
    const id = string.substring(31, 53);
    const URI = `spotify:track:${id}`;
    return { URI, id };
  } else {
    const searchQuery = parts.slice(1).join(" ");
    if (!searchQuery) return 

    const spotfyData = await spotifyClient.searchSong(channelID, searchQuery);
    console.log(spotfyData)
    if (!spotfyData || spotfyData.tracks?.total === 0) return 
    const URI = spotfyData.tracks?.items[0].uri;
    const id = spotfyData.tracks?.items[0].id;
    if (!URI || !id) return 
    return { URI, id };
  }
}

interface returnData {
  URI: string;
  id: string;
}
