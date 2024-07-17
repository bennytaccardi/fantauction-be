import Fastify from "fastify";
import autoload from "@fastify/autoload";
import { join } from "path";

const fastify = Fastify({
  logger: true,
});

fastify.register(autoload, {
  dir: join(__dirname, "plugins"),
});

fastify.register(autoload, {
  dir: join(__dirname, "routes"),
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
