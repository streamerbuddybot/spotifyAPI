declare namespace NodeJS {
  export interface ProcessEnv {
    APPWRITE_ENDPOINT: string;
    APPWRITE_PROJECT_ID: string;
    APPWRITE_API_KEY: string;
    APPWRITE_DATABASE_ID: string;
    APPWRITE_COMMANDS_COLLECTION_ID: string;
    APPWRITE_IRC_COLLECTION_ID: string
  }
}
