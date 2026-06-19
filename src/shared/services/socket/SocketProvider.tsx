import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuthSession } from "@shared/services/authSession";
import type { AppSocket, SocketContextValue } from "./socket.types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const SOCKET_BASE_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? "";

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: PropsWithChildren) {
  const { token } = useAuthSession();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<AppSocket | null>(null);

  useEffect(() => {
    const socketUrl = getSocketUrl();

    if (!token || !socketUrl) {
      setIsConnected(false);
      setSocket(null);
      return;
    }

    const nextSocket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    setSocket(nextSocket);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.disconnect();
      setIsConnected(false);
      setSocket(null);
    };
  }, [token]);

  const value = useMemo<SocketContextValue>(
    () => ({
      isConnected,
      socket,
    }),
    [isConnected, socket],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
}

function getSocketUrl() {
  if (SOCKET_BASE_URL.trim()) return normalizeSocketUrl(SOCKET_BASE_URL);

  return getUrlOrigin(API_BASE_URL);
}

function normalizeSocketUrl(url: string) {
  return url.trim().replace(/\/$/, "");
}

function getUrlOrigin(url: string) {
  const normalizedUrl = normalizeSocketUrl(url);
  if (!normalizedUrl) return "";

  try {
    const parsedUrl = new URL(normalizedUrl);
    return parsedUrl.origin;
  } catch {
    return normalizedUrl;
  }
}
