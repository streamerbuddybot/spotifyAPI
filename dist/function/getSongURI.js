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
const spotifyAPI_1 = require("../classes/spotifyAPI");
function default_1(string, channelID, parts) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        if (string.startsWith("spotify:")) {
            // const id = string.substring(14, 39);
            const URI = string;
            const id = URI.substring(14, 39);
            return { URI, id };
        }
        else if (string.startsWith("https://open.spotify.com/track")) {
            const id = string.substring(31, 53);
            const URI = `spotify:track:${id}`;
            return { URI, id };
        }
        else {
            const searchQuery = parts.slice(1).join(" ");
            if (!searchQuery)
                return;
            const spotfyData = yield spotifyAPI_1.spotifyClient.searchSong(channelID, searchQuery);
            console.log(spotfyData);
            if (!spotfyData || ((_a = spotfyData.tracks) === null || _a === void 0 ? void 0 : _a.total) === 0)
                return;
            const URI = (_b = spotfyData.tracks) === null || _b === void 0 ? void 0 : _b.items[0].uri;
            const id = (_c = spotfyData.tracks) === null || _c === void 0 ? void 0 : _c.items[0].id;
            if (!URI || !id)
                return;
            return { URI, id };
        }
    });
}
exports.default = default_1;
