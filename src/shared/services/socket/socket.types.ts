import type { Socket } from "socket.io-client";

export type AppSocket = Socket;

export type SocketContextValue = {
  isConnected: boolean;
  socket: AppSocket | null;
};
