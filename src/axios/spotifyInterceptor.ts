import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";
import { spotifyTokensDB } from "../classes/database";
import { spotifyClient } from "../classes/spotifyAPI";


const spotifyAPI = axios.create({
  baseURL: "https://api.spotify.com/v1",
  headers: {
    Accept: "application/json",
  },
});

//spotify request interceptor
spotifyAPI.interceptors.request.use(
  (request) => {
    return request;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for spotify API calls
spotifyAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  //handle response error
  async function (error) {
    //originalRequest
    const originalRequest = error.config;

    //if the error status = 401 we update the token and retry
    if (error.response.status === 401 || (error.response.status === 503 && !originalRequest._retry)) {
      originalRequest._retry = true;

      //get the channel from the request
      const channelID = error.response?.config.channelID;

      const tokens = await spotifyTokensDB.getSpotifyTokens(channelID);
      if (!tokens) {
        //TODO handle error
        return;
      }

      //fetch the new accessToken
      const newTokens = await spotifyClient.refreshToken(channelID, tokens.refreshToken);

      console.log("refreshing spotify Token Tokens........");

      //update the headers for the new request
      error.config.headers = JSON.parse(JSON.stringify(error.config.headers || {})) as RawAxiosRequestHeaders;
      originalRequest.headers["Authorization"] = "Bearer " + newTokens;
      //make the new request
      const res = spotifyAPI(originalRequest);

      return res;
    }
    return Promise.reject(error);
  }
);

export { spotifyAPI };
