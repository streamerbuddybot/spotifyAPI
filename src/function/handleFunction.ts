import { TwitchDBHandler } from "../classes/TwitchDB";
import { spotifyDB } from "../classes/database";
import { spotifyClient } from "../classes/spotifyAPI";
import CheckMessageVariabels from "./CheckMessageVariabels";
import getSongURI from "./getSongURI";

export async function handleFunction(data: spotifyFunction): Promise<string> {
  const messageArray = data.userinput.trim().split(" ");


  switch (data.action) {
    case "songrequest":

      //get the spotify song request settings
      const spotifySettings = await spotifyDB.getStreamerSettings(data.channelID);

      //check if we have the spotify settings
      if (!spotifySettings) return "Please set up your spotify integration";

      //check OnlyWhenOnline is enabled
      if (spotifySettings.OnlyWhenOnline) {
        //get the streamer live status
        const isLive = await TwitchDBHandler.getStreamerLiveStatus(data.channelID.toString());

        //if the streamer is offline return a message
        if (!isLive) return "Sorry I can't take song requests right now";
      }

      //check if banned viewers are enabled
      if (spotifySettings.BannedViewers) {
        //check if the user is banned
        const bannedViewer = await spotifyDB.checkViewerBan(data.channelID, data.userID);

        //if the user is banned return a message
        if (bannedViewer) return "${user.username}, your access for using song request has been restricted.";
      }

      //check for missing data
      if (!messageArray) return "Please provide a song";

      //get the song uri based of the user input
      const searchSong = await getSongURI(data.userinput, data.channelID,);

      //if the uri is undefined return a message
      if (!searchSong) return "Sorry I couldn't find that song";

      //deconstruct the uri
      const { URI, id } = searchSong;

      //if banned sogns are enabled
      if (spotifySettings.BannedSongs) {
        //check if the song is banned
        const bannedSong = await spotifyDB.checkSongBan(data.channelID, id);

        //if the song is banned return a message
        if (bannedSong) return "${user.username} I regret to inform you that this song is currently restricted and cannot be played upon request.";
      }

      // add the song to the queue
      const addSongToQueue = await spotifyClient.addSongtoQueue(data.channelID, URI);

      //if we can't find the song return a message
      if (addSongToQueue === 400) return "Sorry I couldn't find that song";

      // //if the response is null return a message
      if (addSongToQueue === 500) return "Something went wrong please try again";

      //get the song details from spotify
      const songDetails = await spotifyClient.getTrack(id, data.channelID);

      //if we can't get the song details return a message
      if (!songDetails) return "song is added to the queue but I couldn't get the song details";

      //replace the song request message variables with the song details
      const message = CheckMessageVariabels(data.message, songDetails, data.channelID);

      //return the message
      return message;

    default:
      return `${data.action} not found`;
  }
}

