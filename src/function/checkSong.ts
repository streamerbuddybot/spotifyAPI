import { spotifyDB } from "../classes/database";
import { spotifyClient } from "../classes/spotifyAPI";

interface IntervalMap {
  [channelID: number]: NodeJS.Timeout;
}

const intervals: IntervalMap = {};

export function startCheckingCurrentSong(channelID: number): void {
  // Check if the interval is already running for the given channelID
  if (intervals[channelID]) {
    console.log(`Interval is already running for channel ${channelID}`);
    return;
  }

  let songID: string = "";
  console.log("start checking current song");
  intervals[channelID] = setInterval(async () => {
    const res = await spotifyClient.getCurrentlyPlaying(channelID);

    if (!res) {
      console.log("No song is currently playing");
      startCheckingCurrentSong(channelID);
      return;
    }
    if (res.item?.id === songID) {
      return;
    }
    songID = res.item?.id ?? "";
    console.log("new song playing" + res.item?.name);

    const queue = await spotifyDB.getQueue(+channelID);

    if (!queue || queue.total === 0) {
      //stop the interval
      console.log("queue is empty stopping interval");
      stopCheckingCurrentSong(channelID);
    }

    queue?.documents.forEach(async (song) => {
      if (song.songID === res.item?.id) {
        //remove the song from the queue
        await spotifyDB.removeSongFromQueue(queue!.documents[0].$id!);
      }
    });

  
  }, 5000); // 5000 milliseconds = 5 seconds
}

export function stopCheckingCurrentSong(channelID: number): void {
  if (intervals[channelID]) {
    console.log(`Stopped checking for channel ${channelID}`);
    clearInterval(intervals[channelID]);
    delete intervals[channelID];
  } else {
    console.log(`No interval found for channel ${channelID}`);
  }
}

export function isCheckingCurrentSong(channelID: number): boolean {
  return !!intervals[channelID];
}
