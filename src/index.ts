import Fastify from "fastify";
import autoload from "@fastify/autoload";
import { join } from "path";
import fastifySecureSession from "@fastify/secure-session";
import * as fs from "fs";
import * as path from "path";

const fastify = Fastify({
  logger: true,
});

// fastify.register(fastifySecureSession, {
//   sessionName: "testSession",
//   cookieName: "test-session-cookie",
//   key: fs.readFileSync(path.join(__dirname, "../secret-key")),
//   expiry: 24 * 60, // 1h
//   cookie: {
//     path: "/",
//   },
// });

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
