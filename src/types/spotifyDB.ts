import { Models } from "node-appwrite";

export interface SpotifyStreammerSetting {
  channelID: number;
  MaxUserQueue: number;
  BannedSongs: boolean;
  BannedViewers: boolean;
  MaxUserQueueEnabled: boolean;
}

export interface SpotifyStreammerSettingStorage extends Models.Document, SpotifyStreammerSetting {}


export interface SpotifyIntergration {
  userID: string;
  accessToken: string;
  refreshToken: string;
  channelID: number;
}

export interface SpotifyIntergrationStorage extends Models.Document, SpotifyIntergration {}
