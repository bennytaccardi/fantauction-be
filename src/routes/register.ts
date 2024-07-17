import { FastifyPluginAsync } from "fastify";

const participatingUsers = new Set();
let count = 0;

const registerRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/register", { websocket: true }, (socket, req) => {
    socket.on("message", (message: any) => {
      participatingUsers.add(message.userId);
      socket.send(
        JSON.stringify({
          playerBidValue: count,
        })
      );
    });
  });
};

export default registerRoute;
