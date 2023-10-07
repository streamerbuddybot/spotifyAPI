import * as grpc from "@grpc/grpc-js";
import { SendSongRequestRequest, SendSpotifyRequestResponse, SpotifyServiceClient, UnimplementedSpotifyServiceService } from "../proto/spotify";
import * as config from "../config.json";
import { handleFunction } from "../function/handleFunction";
// import { eventsub } from "../functions/handleEventsub";

const server = new grpc.Server();
const port = config.grpcServer.port;
const host = config.grpcServer.host;

async function grpcServer() {
  const serviceImpl = {
    SendEvent: async (
      call: grpc.ServerUnaryCall<SendSongRequestRequest, SendSpotifyRequestResponse>,
      callback: grpc.sendUnaryData<SendSpotifyRequestResponse>
    ) => {
      let { data} = call.request.toObject();
      if (!data)
        return callback(null, new SendSpotifyRequestResponse({ status: 401, message: "Missing channelID or songrequest data" }));

        const message: string = await handleFunction(JSON.parse(data));
        
        


      callback(null, new SendSpotifyRequestResponse({ status: 200, message: message }));
    },
  };
  server.addService(SpotifyServiceClient.service, serviceImpl);
  server.bindAsync(`${host}:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    server.start();
    console.log("server running on port", `${host}:${port}`);
  });
}

export default grpcServer;
