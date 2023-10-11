import { Query } from "node-appwrite";
import { database } from "../utils/appwrite";
import { TwitchUserStorage } from "../types/twitchUser";

class TwitchDB {
  databaseID: string;
  collectionID: string;

  constructor() {
    this.databaseID = "64392da4b5e0c9e0949d";
    this.collectionID = "64393117418a284d87a6";
  }

  //get the streamewr details based of channelID
  async getStreamerLiveStatus(channelID: string): Promise<boolean> {
    try {
      const search = await database.listDocuments<TwitchUserStorage>(this.databaseID, this.collectionID, [
        Query.limit(1),
        Query.equal("channelID", +channelID),
      ]);
      return search.documents[0].isLive
    } catch (error) {
      throw new Error("Error getting data from database");
    }
  }

 

}

export const TwitchDBHandler = new TwitchDB();
