import { WebSocket } from "ws";

export interface ClientInfo {
  socket: WebSocket;
  groupId: string;
}
