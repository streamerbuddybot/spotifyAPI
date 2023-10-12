import * as grpc from "@grpc/grpc-js";
import { SpotifyServiceClient, spotifyQueueRequest, spotifyQueueResponse, spotifyRequest, spotifyResponse, spotifySongDetails, spotifySongDetailsRequest, spotifySongDetailsResponse } from "../proto/spotify";
import * as config from "../config.json";
import { handleFunction, getSongDetails, getQueue } from "../function/handleFunction";
import { startCheckingCurrentSong } from "../function/checkSong";
// import { eventsub } from "../functions/handleEventsub";

const server = new grpc.Server();
const port = config.spotifyAPI.port;
const host = config.spotifyAPI.host;

async function grpcServer() {
  const serviceImpl = {
    SendEvent: async (
      call: grpc.ServerUnaryCall<spotifyRequest, spotifyResponse>,
      callback: grpc.sendUnaryData<spotifyResponse>
    ) => {
      let data = call.request.toObject();
      if (!data)
        return callback(null, new spotifyResponse({ status: 401, responseMessage: "Missing channelID or songrequest data" }));

      const spotifyData: spotifyFunction = {
        channelID: data.channelID || 0,
        userID: data.userID || 0,
        message: data.message || "",
        action: data.action || "",
        userinput: data.userinput || "",
        username: data.username || "",
      }

      const message: string = await handleFunction(spotifyData);

      callback(null, new spotifyResponse({ status: 200, responseMessage: message }));
    },
    getSongDetails: async (
      call: grpc.ServerUnaryCall<spotifySongDetailsRequest, spotifySongDetailsResponse>,
      callback: grpc.sendUnaryData<spotifySongDetailsResponse>
    ) => {
      let data = call.request.toObject();
      if (!data)
        return callback(null, new spotifySongDetailsResponse({ status: 400,}));

        const channelID = data.channelID
        if(!channelID) return callback(null, new spotifySongDetailsResponse({ status: 400,}));

      const message = await getSongDetails(channelID);

      if(!message) return callback(null, new spotifySongDetailsResponse({ status: 400,}))

      callback(null, new spotifySongDetailsResponse({ status: 200, songDetails: message   }));
    },
    getQueue: async (
      call: grpc.ServerUnaryCall<spotifyQueueRequest, spotifyQueueResponse>,
      callback: grpc.sendUnaryData<spotifyQueueResponse>
    ) => {
      let data = call.request.toObject();
      if (!data)
        return callback(null, new spotifyQueueResponse({ status: 400,}));

        const channelID = data.channelID
        if(!channelID) return callback(null, new spotifyQueueResponse({ status: 400,}));

      const queue = await getQueue(channelID);

      if(!queue) return callback(null, new spotifyQueueResponse({ status: 400,}))


      callback(null, new spotifyQueueResponse (queue));
    },

   

  
  };
  server.addService(SpotifyServiceClient.service, serviceImpl);
  server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    server.start();
    console.log("server running on port", `${host}:${port}`);
  });
}

export default grpcServer;

