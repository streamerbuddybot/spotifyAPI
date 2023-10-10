import { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    channelID?: number; // Your custom property
    // Add more custom properties as needed
  }
}