import fp from "fastify-plugin";
import fastifyWebSockets from "@fastify/websocket";

export default fp(async (fastify) => {
  fastify.register(fastifyWebSockets);
});
