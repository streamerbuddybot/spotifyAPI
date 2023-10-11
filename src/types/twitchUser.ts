import { Models } from "node-appwrite";

export interface TwitchUser {
  username: string;
  channelID: number;
  accessToken: string;
  refreshToken: string;
  broadcasterType: string;
  profileImage: string; // Assuming profileImage is a URL
  offlineImage: string; // Assuming offlineImage is a URL
  IRC: boolean;
  userid: string;
  email: string; // Assuming email is a valid email address
  teamID: string;
  membershipID: string;
  betaAccess: boolean; // Default value set to false
  isLive: boolean;
}


export interface TwitchUserStorage extends Models.Document, TwitchUser {}