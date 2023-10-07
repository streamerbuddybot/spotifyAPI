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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFunction = void 0;
const database_1 = require("../classes/database");
const spotifyAPI_1 = require("../classes/spotifyAPI");
const CheckMessageVariabels_1 = __importDefault(require("./CheckMessageVariabels"));
const getSongURI_1 = __importDefault(require("./getSongURI"));
function handleFunction(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(data.responseMessage);
        const functionType = data.Function.split(".")[1];
        switch (functionType) {
            case "songrequest":
                //get the spotify song request settings
                const spotifySettings = yield database_1.spotifyDB.getStreamerSettings(data.channelID);
                //check if we have the spotify settings
                if (!spotifySettings)
                    return "Please set up your spotify integration";
                //check if banned viewers are enabled
                if (spotifySettings.BannedViewers) {
                    //check if the user is banned
                    const bannedViewer = yield database_1.spotifyDB.checkViewerBan(data.channelID, data.viewerID);
                    //if the user is banned return a message
                    if (bannedViewer)
                        return "${user.username}, your access for using song request has been restricted.";
                }
                //check for missing data
                if (!data.parts[1])
                    return "Please provide a song";
                //get the song uri based of the user input
                const searchSong = yield (0, getSongURI_1.default)(data.parts[1], data.channelID, data.parts);
                //if the uri is undefined return a message
                if (!searchSong)
                    return "Sorry I couldn't find that song";
                //deconstruct the uri
                const { URI, id } = searchSong;
                //if banned sogns are enabled
                if (spotifySettings.BannedSongs) {
                    //check if the song is banned
                    const bannedSong = yield database_1.spotifyDB.checkSongBan(data.channelID, id);
                    //if the song is banned return a message
                    if (bannedSong)
                        return "${user.username} I regret to inform you that this song is currently restricted and cannot be played upon request.";
                }
                // add the song to the queue
                const addSongToQueue = yield spotifyAPI_1.spotifyClient.addSongtoQueue(data.channelID, URI);
                //if we can't find the song return a message
                if (addSongToQueue === 400)
                    return "Sorry I couldn't find that song";
                // //if the response is null return a message
                if (addSongToQueue === 500)
                    return "Something went wrong please try again";
                //get the song details from spotify
                const songDetails = yield spotifyAPI_1.spotifyClient.getTrack(id, data.channelID);
                //if we can't get the song details return a message
                if (!songDetails)
                    return "song is added to the queue but I couldn't get the song details";
                //replace the song request message variables with the song details
                const message = (0, CheckMessageVariabels_1.default)(data.responseMessage, songDetails, data.channelID);
                //return the message
                return message;
            default:
                return `${data.Function} not found`;
        }
    });
}
exports.handleFunction = handleFunction;
