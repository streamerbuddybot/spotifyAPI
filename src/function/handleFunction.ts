import { TwitchDBHandler } from "../classes/TwitchDB";
import { spotifyDB } from "../classes/database";
import { spotifyClient } from "../classes/spotifyAPI";
import { spotifyQueue, spotifyQueueResponse, spotifySongDetails, spotifySongDetailsResponse } from "../proto/spotify";
import CheckMessageVariabels from "./CheckMessageVariabels";
import { isCheckingCurrentSong, startCheckingCurrentSong } from "./checkSong";
import getSongURI from "./getSongURI";

export async function handleFunction(data: spotifyFunction): Promise<string> {
  const messageArray = data.userinput.trim().split(" ");

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
  switch (data.action) {
    case "songrequest":
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
      const searchSong = await getSongURI(data.userinput, data.channelID);

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

      //check if the interval is running
      if (isCheckingCurrentSong(data.channelID)) {
        //add the song to the database queue
        await spotifyDB.addSongToQueue({
          channelID: data.channelID,
          requested_by: data.username,
          songname: songDetails!.name,
          songID: songDetails!.id,
          userID: data.userID,
        });
      } else {
        //add the song to the database queue
        await spotifyDB.addSongToQueue({
          channelID: data.channelID,
          requested_by: data.username,
          songname: songDetails!.name,
          songID: songDetails!.id,
          userID: data.userID,
        });
        //start the interval
        startCheckingCurrentSong(data.channelID);
      }

      //replace the song request message variables with the song details
      const SongRequestMessage = CheckMessageVariabels(data.message, songDetails, data.channelID);

      //return the message
      return SongRequestMessage;

    //skip a song 
    case "skip":
      //skip the current song
      await spotifyClient.skipSong(data.channelID);
            
      //return a message
      return data.message;

    default:
      return `${data.action} not found`;
  }
}

export async function getSongDetails(channelID: number): Promise<spotifySongDetails | null> {
  const songDetails = await spotifyClient.getPlaybackState(channelID);

  if (!songDetails) return null;

  const volume = songDetails.device?.volume_percent ?? undefined;
  const progress = songDetails.progress_ms ?? undefined;

  const response = new spotifySongDetails({
    album: songDetails.item.album.name,
    duration: songDetails.item.duration_ms,
    artist: songDetails.item.artists[0].name,
    song: songDetails.item.name,
    imageURL: songDetails.item.album.images[0].url,
    isPlaying: songDetails.is_playing,
    release_date: songDetails.item.album.release_date,
    songID: songDetails.item.id,
    songURL: songDetails.item.external_urls.spotify,
    volume: volume,
    progress: progress,
  });
  return response;
}

export async function getQueue(channelID: number) {
  const res = await spotifyDB.getQueue(channelID);

  if (!res) return new spotifyQueueResponse({ status: 500, statusMessage: "something went wrong" });

  if (res.total === 0) return new spotifyQueueResponse({ status: 200, statusMessage: "queue is empty", totalSongs: res.total });

  const queue = res.documents.map((song) => {
    return new spotifyQueue({
      channelID: song.channelID,
      requested_by: song.requested_by,
      songname: song.songname,
      songID: song.songID,
      userID: song.userID,
    });
  });

  console.log(queue);

  const queueReponse = new spotifyQueueResponse({
    status: 200,
    statusMessage: "success",
    queue: queue,
    totalSongs: res.total,
  });

  return queueReponse;
}
