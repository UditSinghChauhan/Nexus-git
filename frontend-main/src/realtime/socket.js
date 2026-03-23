import { io } from "socket.io-client";
import { API_BASE } from "../config";

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(API_BASE, {
      transports: ["websocket", "polling"],
    });
  }

  return socketInstance;
}
