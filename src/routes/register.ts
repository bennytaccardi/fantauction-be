// import { FastifyPluginAsync } from "fastify";
// import { dbInstance } from "../db/init";

// const registerRoute: FastifyPluginAsync = async (fastify) => {
//   fastify.get("/register", { websocket: true }, async (socket, req) => {
//     const { data, error } = await dbInstance.from("rooms").insert({
//       client: "test",
//     });
//     console.log(data, error);
//     socket.on("message", (message: any) => {});
//   });
// };

// export default registerRoute;
