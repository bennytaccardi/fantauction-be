import { FastifyPluginAsync } from "fastify";
import { WebSocket } from "ws";

interface ClientInfo {
  socket: WebSocket;
  groupId: string;
}

let count = 0;
const timeout = 5;
let timeoutHandle: NodeJS.Timeout;

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

const bidRoute: FastifyPluginAsync = async (fastify) => {
  const clients: Map<WebSocket, ClientInfo> = new Map();
  fastify.get("/bid", { websocket: true }, (socket, req) => {
    socket.on("message", (message: any) => {
      const data = JSON.parse(message);
      const body = data.body;
      const header = data.header;
      const leagueId = header.leagueId;

      clients.set(socket, { socket, groupId: leagueId });
      count += body.bid;
      clearTimeout(timeoutHandle);
      timeoutHandle = setTimeout(function () {
        sendMessageToGroup("test", clients, {
          playerBidValue: count,
          timeout,
          end: true,
          winnerTeam: "nulltest",
        });
      }, 5000);
      sendMessageToGroup("test", clients, {
        playerBidValue: count,
        timeout,
        end: false,
        winnerTeam: null,
      });
    });
  });
};

export default bidRoute;
