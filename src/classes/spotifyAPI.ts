import axios, { AxiosRequestConfig } from "axios";
import { spotifyAPI } from "../axios/spotifyInterceptor";
import qs from "qs";
import { spotifyTokensDB } from "./database";
import dotenv from "dotenv";
import { CurrentlyPlayingResponse, SearchResponse, SingleTrackResponse, UsersQueueResponse } from "../types/spotifywebapi";
dotenv.config();

interface IProductWithPrice extends AxiosRequestConfig {
  channelID: number;
}

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

class SpotifyWebApi {
  //gereral Headers for the spotify WEB api
  private async Headers(channelID: number) {
    let spotifyData = await spotifyTokensDB.getSpotifyTokens(channelID);
    if (!spotifyData || !spotifyData.accessToken) {
      return;
    }
    return {
      Authorization: `Bearer ${spotifyData.accessToken}`,
    };
  }

  //a medhod to refresh the accessToken if we get a 401 and push it to the DB
  async refreshToken(channelID: number, refreshToken: string) {
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
          username: client_id!,
          password: client_secret!,
        },
      };
      const response = await axios.post("https://accounts.spotify.com/api/token", qs.stringify(data), headers);

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      await spotifyTokensDB.updateSpotifyTokens(channelID, accessToken, refreshToken);

      return accessToken;
    } catch (error: any) {
      console.log(error!.response.data);
    }
  }

  //get the song that is currently playing
  public async getCurrentlyPlaying(channelID: number) {
    try {
      let response = await spotifyAPI.get<CurrentlyPlayingResponse>("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: await this.Headers(channelID),
        channelID: channelID,
      });

      return response.data;
    } catch (error: any) {
      console.log(error);
      console.log(error.response.data)
      return;
    }
  }

  //get playback state 
  public async getPlaybackState(channelID: number) {
    try {
      let response = await spotifyAPI.get<CurrentlyPlayingResponse>("https://api.spotify.com/v1/me/player/", {
        headers: await this.Headers(channelID),
        channelID: channelID,
      });

      return response.data;
    } catch (error: any) {
      console.log(error);
      return;
    }
  }

  //get the song details based of ID
  public async getTrack(id: string, channelID: number) {
    try {
      const res = await spotifyAPI.get<SingleTrackResponse>(`/tracks/${id}`, {
        headers: await this.Headers(channelID),
        channelID: channelID,
      });
      return res.data;
    } catch (error: any) {
      console.log(error);
      return;
    }
  }

  // add a song to the streamers queue based of channelID
  public async addSongtoQueue(channelID: number, uri: string) {
    try {
      const res = await spotifyAPI.post(`/me/player/queue?uri=${uri}`, null, {
        headers: await this.Headers(channelID),
        channelID: channelID,
      });
    } catch (error: any) {
      console.log(error);
      if (error.response.data.error.status === 400) {
        return 400;
      }
      console.log(error.response);
      return 500;
    }
  }

  //get the queue of the streamers spotify
  public async getQueue(channelID: number) {
    try {
      const res = await spotifyAPI.get<UsersQueueResponse>("/me/player/queue", {
        headers: await this.Headers(channelID),
        channelID: channelID,
      });
      // console.log(res.data)
      return res.data;
    } catch (error: any) {
      console.log(error.response);
    }
  }

  //search for a song based of query
  public async searchSong(channelID: number, query: string) {
    console.log(`searching for ${query}`);
    try {
      const res = await spotifyAPI.get<SearchResponse>(`/search?q=${query}&type=track&limit=1`, {
        headers: await this.Headers(channelID),
        channelID: channelID,
      });
      return res.data;
    } catch (error: any) {
      console.log(error.response.data);
    }
  }

  //skip the current song
  public async skipSong(channelID: number) {
    try {
      const res = await spotifyAPI.post("/me/player/next", null, {
        headers: await this.Headers(channelID),
        channelID: channelID,
      });
      return res.data;
    } catch (error: any) {
      console.log(error.response.data);
    }
  }
}

const spotifyClient = new SpotifyWebApi();

export { spotifyClient };
