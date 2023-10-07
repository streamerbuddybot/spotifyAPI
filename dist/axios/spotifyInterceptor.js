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
exports.spotifyAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../classes/database");
const spotifyAPI_1 = require("../classes/spotifyAPI");
const spotifyAPI = axios_1.default.create({
    baseURL: "https://api.spotify.com/v1",
    headers: {
        Accept: "application/json",
    },
});
exports.spotifyAPI = spotifyAPI;
//spotify request interceptor
spotifyAPI.interceptors.request.use((request) => {
    return request;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor for spotify API calls
spotifyAPI.interceptors.response.use((response) => {
    return response;
}, 
//handle response error
function (error) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        //originalRequest
        const originalRequest = error.config;
        //if the error status = 401 we update the token and retry
        if (error.response.status === 401 || (error.response.status === 503 && !originalRequest._retry)) {
            originalRequest._retry = true;
            //get the channel from the request
            const channelID = (_a = error.response) === null || _a === void 0 ? void 0 : _a.config.channelID;
            const tokens = yield database_1.spotifyTokensDB.getSpotifyTokens(channelID);
            if (!tokens) {
                //TODO handle error
                return;
            }
            //fetch the new accessToken
            const newTokens = yield spotifyAPI_1.spotifyClient.refreshToken(channelID, tokens.refreshToken);
            console.log("refreshing spotify Token Tokens........");
            //update the headers for the new request
            error.config.headers = JSON.parse(JSON.stringify(error.config.headers || {}));
            originalRequest.headers["Authorization"] = "Bearer " + newTokens;
            //make the new request
            const res = spotifyAPI(originalRequest);
            return res;
        }
        return Promise.reject(error);
    });
});
