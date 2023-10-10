import * as grpc from "@grpc/grpc-js";
import { SpotifyServiceClient, spotifyRequest, spotifyResponse } from "../proto/spotify";
import * as config from "../config.json";
import { handleFunction } from "../function/handleFunction";
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
      }

      const message: string = await handleFunction(spotifyData);

      callback(null, new spotifyResponse({ status: 200, responseMessage: message }));
    },
  };
  server.addService(SpotifyServiceClient.service, serviceImpl);
  server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    server.start();
    console.log("server running on port", `${host}:${port}`);
  });
}

export default grpcServer;
