"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(part, songDetails, channelID) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.default = default_1;
function msToTime(ms) {
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
