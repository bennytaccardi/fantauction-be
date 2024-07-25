import { FastifyPluginAsync } from "fastify";
import { WebSocket } from "ws";
import { BidHeader, BidMessage } from "../models/bid-message";
import { ClientInfo } from "../types/client-info";
import { PlayerBidSession } from "../types/player-bid-session";
import S from "fluent-json-schema";
import { dbInstance } from "../db/init";

const timeout = 100;
let timeoutHandle: NodeJS.Timeout;
const rooms = new Map();

export default async function bid(fastify: any, opts: any) {
  fastify.route({
    method: "POST",
    path: "/bids",
    schema: {
      description: "Route used to create a new bid",
      body: S.object().prop("playerName", S.string().required()),
      response: {
        201: S.object().prop("created", S.boolean()),
      },
    },
    handler: createNewBid,
  });

  async function createNewBid(req: any, reply: any) {
    const headers = req.headers;
    try {
      await dbInstance.from("auctions").insert({
        league_id: headers.league_id,
        player_name: req.body.playerName,
      });

      reply.code(201);
      return { created: true };
    } catch (error) {
      console.error("Error creating new bid:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  }

  fastify.get("/bid", { websocket: true }, (socket: any, req: any) => {
    socket.on("message", async (message: string) => {
      const body: BidMessage = JSON.parse(message);
      const header: BidHeader = { teamName: req.headers.team_name };
      const result = await dbInstance
        .from("auctions")
        .select("*")
        .eq("league_id", body.leagueId)
        .eq("player_name", body.playerName)
        .eq("ongoing", 1)
        .lte("bid", body.bid);

      if (!result.data || !result.data.length) {
        return socket.close(1011, "error");
      }

      console.log(result.data);
      const auction = result.data![0];
      console.log(auction);
      await dbInstance
        .from("auctions")
        .update({
          ...auction,
          bid: +body.bid,
          current_winning_team: header.teamName,
        })
        .eq("id", auction.id);

      // const session = req.testSession;
      // const data: BidMessage = JSON.parse(message);
      // const body = data.body;
      // const header = data.header;
      // const leagueId = header.leagueId;
      // const playerBidKey = `${leagueId}#${body.playerName}`;
      // const playerBid = session.get(playerBidKey);
      // const playerBidValue = (playerBid ? playerBid.bidValue : 0) + body.bid;
      // rooms.set(playerBidKey, {
      //   bidValue: playerBidValue,
      //   playerName: playerBid?.playerName ?? body.playerName,
      //   sockets: [...rooms.get(playerBidKey).sockets, socket],
      // });
      // clients.set(socket, { socket, groupId: leagueId });
      // clearTimeout(timeoutHandle);
      // timeoutHandle = setTimeout(function () {
      //   sendMessageToGroup("test", clients, {
      //     playerBidValue: playerBidValue,
      //     timeout,
      //     end: true,
      //     winnerTeam: "nulltest",
      //   });
      // }, timeout * 1000);
      // sendMessageToGroup("test", clients, {
      //   playerBidValue: playerBidValue,
      //   timeout,
      //   end: false,
      //   winnerTeam: null,
      // });
      // const testsession = req.testSession.get(playerBidKey);
      // console.log(testsession);
    });

    // socket.on("close", (message: string, reason: string) => {
    //   const data = JSON.parse(reason);
    //   console.log(data);
    // });
  });
}

// function sendMessageToGroup(
//   groupId: string,
//   clients: Map<WebSocket, ClientInfo>,
//   message: any
// ) {
//   for (const [_, clientInfo] of clients) {
//     if (
//       clientInfo.groupId === groupId &&
//       clientInfo.socket.readyState === WebSocket.OPEN
//     ) {
//       clientInfo.socket.send(JSON.stringify(message));
//     }
//   }
// }

const bidRoute: FastifyPluginAsync = async (fastify) => {
  const clients: Map<WebSocket, ClientInfo> = new Map();
};
