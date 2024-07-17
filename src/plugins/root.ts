import { FastifyPluginAsync } from "fastify";

const rootRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", (request, reply) => {
    reply.send({ hello: "world" });
  });
};

export default rootRoute;
