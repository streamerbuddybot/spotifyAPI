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
exports.spotifyClient = void 0;
const axios_1 = __importDefault(require("axios"));
const spotifyInterceptor_1 = require("../axios/spotifyInterceptor");
const qs_1 = __importDefault(require("qs"));
const database_1 = require("./database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
class SpotifyWebApi {
    //gereral Headers for the spotify WEB api
    Headers(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            let spotifyData = yield database_1.spotifyTokensDB.getSpotifyTokens(channelID);
            if (!spotifyData || !spotifyData.accessToken) {
                return;
            }
            return {
                Authorization: `Bearer ${spotifyData.accessToken}`,
            };
        });
    }
    //a medhod to refresh the accessToken if we get a 401 and push it to the DB
    refreshToken(channelID, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth: {
                    username: client_id,
                    password: client_secret,
                },
            };
            const data = {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            };
            try {
                const headers = {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    auth: {
                        username: client_id,
                        password: client_secret,
                    },
                };
                const response = yield axios_1.default.post("https://accounts.spotify.com/api/token", qs_1.default.stringify(data), headers);
                const accessToken = response.data.access_token;
                const refreshToken = response.data.refresh_token;
                yield database_1.spotifyTokensDB.updateSpotifyTokens(channelID, accessToken, refreshToken);
                return accessToken;
            }
            catch (error) {
                console.log(error.response.data);
            }
        });
    }
    //get the song that is currently playing
    getCurrentlyPlaying(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield spotifyInterceptor_1.spotifyAPI.get("https://api.spotify.com/v1/me/player/currently-playing", {
                    headers: yield this.Headers(channelID),
                    channelID: channelID,
                });
                return response.data.item;
            }
            catch (error) {
                console.log(error);
                return;
            }
        });
    }
    //get the song details based of ID
    getTrack(id, channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield spotifyInterceptor_1.spotifyAPI.get(`/tracks/${id}`, {
                    headers: yield this.Headers(channelID),
                    channelID: channelID,
                });
                return res.data;
            }
            catch (error) {
                console.log(error);
                return;
            }
        });
    }
    // add a song to the streamers queue based of channelID
    addSongtoQueue(channelID, uri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield spotifyInterceptor_1.spotifyAPI.post(`/me/player/queue?uri=${uri}`, null, {
                    headers: yield this.Headers(channelID),
                    channelID: channelID,
                });
            }
            catch (error) {
                console.log(error);
                if (error.response.data.error.status === 400) {
                    return 400;
                }
                console.log(error.response);
                return 500;
            }
        });
    }
    //get the queue of the streamers spotify
    getQueue(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield spotifyInterceptor_1.spotifyAPI.get("/me/player/queue", {
                    headers: yield this.Headers(channelID),
                    channelID: channelID,
                });
                // console.log(res.data)
                return res.data;
            }
            catch (error) {
                console.log(error.response);
            }
        });
    }
    searchSong(channelID, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield spotifyInterceptor_1.spotifyAPI.get(`/search?q=${query}&type=track&limit=1`, {
                    headers: yield this.Headers(channelID),
                    channelID: channelID,
                });
                return res.data;
            }
            catch (error) {
                // console.log(error.response.data);
            }
        });
    }
}
const spotifyClient = new SpotifyWebApi();
exports.spotifyClient = spotifyClient;
