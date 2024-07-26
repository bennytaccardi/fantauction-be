import { FastifyPluginAsync } from "fastify";
import { BidHeader, BidMessage } from "../models/bid-message";
import { ClientInfo } from "../types/client-info";
import { PlayerBidSession } from "../types/player-bid-session";
import S from "fluent-json-schema";
import { dbInstance } from "../db/init";
import WebSocket from "ws";
import { appContext } from "../appContext";

const timeout = 5;
let timeoutHandle: NodeJS.Timeout;
const rooms = new Map();
const clients: Map<WebSocket, ClientInfo> = new Map();

function sendMessageToGroup(
  groupId: string,
  clients: Map<WebSocket, ClientInfo>,
  message: any
) {
  for (const [_, clientInfo] of clients) {
    if (
      clientInfo.groupId === groupId &&
      clientInfo.socket.readyState === WebSocket.OPEN
    ) {
      clientInfo.socket.send(JSON.stringify(message));
    }
  }
}

async function terminateAuction(
  groupId: string,
  clients: Map<WebSocket, ClientInfo>,
  auctionId: number
) {
  for (const [_, clientInfo] of clients) {
    if (
      clientInfo.groupId === groupId &&
      clientInfo.socket.readyState === WebSocket.OPEN
    ) {
      const updateResult = await dbInstance
        .from("auctions")
        .update({ ongoing: 0 })
        .eq("id", auctionId);

      if (updateResult.error) {
        return clientInfo.socket.close(1011, "error");
      }
      try {
        const selectResult =
          await appContext.repositories.auctionRepository.getAuctionById(
            auctionId
          );
        clientInfo.socket.send(JSON.stringify(selectResult));
      } catch (error) {
        return clientInfo.socket.close(1011, "error");
      }
    }
  }
}

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
      clients.set(socket, { socket, groupId: body.leagueId });
      const selectResult = await dbInstance
        .from("auctions")
        .select("*")
        .eq("league_id", body.leagueId)
        .eq("player_name", body.playerName)
        .eq("ongoing", 1)
        .lte("bid", body.bid);

      if (!selectResult.data || !selectResult.data.length) {
        return socket.close(1011, "error");
      }

      const auction = selectResult.data[0];

      timeoutHandle = setTimeout(async function () {
        await terminateAuction(body.leagueId, clients, auction.id);
      }, timeout * 1000);

      const toUpdateObj = {
        ...auction,
        bid: +body.bid,
        current_winning_team: header.teamName,
      };

      const updateResult = await dbInstance
        .from("auctions")
        .update(toUpdateObj)
        .eq("id", auction.id);

      if (!updateResult.error) {
        sendMessageToGroup(body.leagueId, clients, toUpdateObj);
      }
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

// const bidRoute: FastifyPluginAsync = async (fastify) => {
//   const clients: Map<WebSocket, ClientInfo> = new Map();
// };
