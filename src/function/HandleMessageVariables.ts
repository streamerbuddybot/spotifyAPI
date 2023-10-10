import { spotifyClient } from "../classes/spotifyAPI";
import { SingleTrackResponse } from "../types/spotifywebapi";

export default async function (part: string, songDetails: SingleTrackResponse, channelID: number): Promise<string> {
  //descrutcture the Function
  const Function = part.split(".");

  switch (Function[0]) {
    case "songrequest":
      switch (Function[1]) {
        case "name":
          return songDetails.name;

        case "artist":
          const artist = songDetails.artists.map((artist) => artist.name).join(", ");
          return artist;

        case "album":
          return songDetails.album.name;

        case "duration":
          return msToTime(songDetails.duration_ms);

        case "url":
          return songDetails.external_urls.spotify;
      }

    default:
      //if we can't find the variable return the original string and add ${} to the start and } to the end
      return "${" + part + "}";


  }
}

function msToTime(ms: number) {
  // Hours, minutes and seconds
  var hrs = ~~(ms / 3600000);
  var mins = ~~((ms % 3600000) / 60000);
  var secs = ~~((ms % 60000) / 1000);

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var time = "";

  if (hrs > 0) {
    time += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  time += "" + mins + ":" + (secs < 10 ? "0" : "");
  time += "" + secs;
  return time;
}

// function calculateTotalDuration(songDurationsMs: number[]): string {
//   const totalDurationMs = songDurationsMs.reduce((accumulator, duration) => accumulator + duration, 0);
//   const totalDurationSeconds = totalDurationMs / 1000;
//   const minutes = Math.floor(totalDurationSeconds / 60);
//   const seconds = Math.floor(totalDurationSeconds % 60);
//   return `${minutes} minutes and ${seconds} seconds`;
// }
