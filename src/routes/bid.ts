import { FastifyPluginAsync } from "fastify";

let count = 0;
const timeout = 5;

const bidRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/bid", { websocket: true }, (socket, req) => {
    socket.on("message", (message: any) => {
      const data = JSON.parse(message);
      count += data.bid;
      setTimeout(function () {
        fastify.websocketServer.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(
              JSON.stringify({
                playerBidValue: count,
                timeout,
                end: true,
                winnerTeam: "nulltest",
              })
            );
          }
        });
      }, 5000);
      fastify.websocketServer.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(
            JSON.stringify({
              playerBidValue: count,
              timeout,
              end: false,
              winnerTeam: null,
            })
          );
        }
      });
    });
  });
};

export default bidRoute;
