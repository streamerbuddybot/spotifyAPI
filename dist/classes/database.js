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
exports.spotifyTokensDB = exports.spotifyDB = void 0;
const node_appwrite_1 = require("node-appwrite");
const appwrite_1 = require("../utils/appwrite");
const database = new node_appwrite_1.Databases(appwrite_1.client);
class SpotifyTokensDB {
    getSpotifyTokens(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            const Tokens = yield database.listDocuments("64e75b50349d812acde7", "64e75b569ae75804e330", [
                node_appwrite_1.Query.equal("channelID", channelID),
            ]);
            if (Tokens.documents.length === 0) {
                return;
            }
            return Tokens.documents[0];
        });
    }
    updateSpotifyTokens(channelID, accessToken, refeshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const Token = yield this.getSpotifyTokens(channelID);
            const DocumentID = Token.$id;
            yield database.updateDocument("64e75b50349d812acde7", "64e75b569ae75804e330", DocumentID, {
                accessToken: accessToken,
                refreshToken: refeshToken,
            });
        });
    }
}
class SpotifyDBclient {
    // async addSongToQueue({
    //   song,
    //   artist,
    //   channelID,
    //   duration,
    //   requested_by,
    //   song_url,
    //   userID,
    // }: AddsongToqueue) {
    //   await database.createDocument(
    //     process.env.APPWRITE_DATABASE_ID,
    //     "6408ba64c1925bfc421b",
    //     ID.unique(),
    //     {
    //       song,
    //       artist,
    //       channelID,
    //       duration,
    //       requested_by,
    //       song_url,
    //     },
    //     [Permission.read(Role.user(userID))]
    //   );
    // }
    // check if the song is banned for song request and return true if it is
    checkViewerBan(channelID, viewerID) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield database.listDocuments("64eea021e0e4804e0d0e", "64f3e217f07063ad99a4", [
                node_appwrite_1.Query.equal("ChannelID", channelID),
                node_appwrite_1.Query.equal("ViewerID", viewerID),
            ]);
            if (res.total === 0) {
                return false;
            }
            return true;
        });
    }
    //check if the song is banned for song request and return true if it is
    checkSongBan(channelID, trackID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bannedSong = yield database.listDocuments("64eea021e0e4804e0d0e", "64eea036557408b933af", [
                    node_appwrite_1.Query.equal("ChannelID", channelID),
                    node_appwrite_1.Query.equal("TrackID", trackID),
                ]);
                if (bannedSong.total === 0) {
                    return false;
                }
                else {
                    return true;
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    //get the spotify streamer settings from database
    getStreamerSettings(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const streamerSettings = yield database.listDocuments("64eea021e0e4804e0d0e", "64eea13235071b511823", [
                    node_appwrite_1.Query.equal("channelID", channelID),
                ]);
                return streamerSettings.documents[0];
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
const spotifyDB = new SpotifyDBclient();
exports.spotifyDB = spotifyDB;
const spotifyTokensDB = new SpotifyTokensDB();
exports.spotifyTokensDB = spotifyTokensDB;
