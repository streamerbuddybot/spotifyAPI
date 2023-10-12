import axios from "axios";
import { Client, Databases, ID, Query, Permission, Role } from "node-appwrite";
import { client } from "../utils/appwrite";
import qs from "qs";
import { SpotifyIntergrationStorage, SpotifyStreammerSettingStorage, queue, queueStorage } from "../types/spotifyDB";

const database = new Databases(client);

class SpotifyTokensDB {
  async getSpotifyTokens(channelID: number) {
    const Tokens = await database.listDocuments<SpotifyIntergrationStorage>("64e75b50349d812acde7", "64e75b569ae75804e330", [
      Query.equal("channelID", channelID),
    ]);
    if (Tokens.documents.length === 0) {
      return;
    }

    return Tokens.documents[0];
  }

  async updateSpotifyTokens(channelID: number, accessToken: string, refeshToken: string) {
    const Token = await this.getSpotifyTokens(channelID);
    const DocumentID = Token!.$id;

    await database.updateDocument("64e75b50349d812acde7", "64e75b569ae75804e330", DocumentID, {
      accessToken: accessToken,
      refreshToken: refeshToken,
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
  async checkViewerBan(channelID: number, viewerID: number) {
    const res = await database.listDocuments("64eea021e0e4804e0d0e", "64f3e217f07063ad99a4", [
      Query.equal("ChannelID", channelID),
      Query.equal("ViewerID", viewerID),
    ]);

    if (res.total === 0) {
      return false;
    }
    return true;
  }

  //check if the song is banned for song request and return true if it is
  async checkSongBan(channelID: number, trackID: string) {
    try {
      const bannedSong = await database.listDocuments("64eea021e0e4804e0d0e", "64eea036557408b933af", [
        Query.equal("ChannelID", channelID),
        Query.equal("TrackID", trackID),
      ]);
      if (bannedSong.total === 0) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  //get the spotify streamer settings from database

  async getStreamerSettings(channelID: number) {
    try {
      const streamerSettings = await database.listDocuments<SpotifyStreammerSettingStorage>("64eea021e0e4804e0d0e", "64eea13235071b511823", [
        Query.equal("channelID", channelID),
      ]);

      return streamerSettings.documents[0];
    } catch (error) {
      console.log(error);
    }
  }

  //get the spotify queue from database
  async getQueue(channelID: number) {
    try {
      const queue = await database.listDocuments<queueStorage>("64eea021e0e4804e0d0e", "6527f88ebc9707f8bab2", [Query.equal("channelID", channelID)]);

      return queue;
    } catch (error) {
      console.log(error);
    }
  }
  async getQueueBasedOfID(channelID: number, songID: string) {
    try {
      const queue = await database.listDocuments<queueStorage>("64eea021e0e4804e0d0e", "6527f88ebc9707f8bab2", [
        Query.equal("channelID", channelID),
        Query.equal("songID", songID),
      ]);

      return queue;
    } catch (error) {
      console.log(error);
    }
  }

  //add a song to the queue
  async addSongToQueue({ channelID, requested_by, songname, userID, songID }: queue) {
    try {
      const queue = await database.createDocument("64eea021e0e4804e0d0e", "6527f88ebc9707f8bab2", ID.unique(), {
        channelID,
        requested_by,
        songname,
        songID,
        userID,
      } as queue);
      return queue;
    } catch (error) {
      console.log(error);
    }
  }

  //remove a song from the queue
  async removeSongFromQueue(documentID: string) {
    try {
      await database.deleteDocument("64eea021e0e4804e0d0e", "6527f88ebc9707f8bab2", documentID);
    } catch (error) {
      console.log(error);
    }
  }
}

const spotifyDB = new SpotifyDBclient();
const spotifyTokensDB = new SpotifyTokensDB();

export { spotifyDB, spotifyTokensDB };
