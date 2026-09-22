'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authClient } from '../lib/auth-client';
import { useSocketStore } from '../store/socket-id-store';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

/**
 * Socket unique pour tout le dashboard. Le provider étant monté dans le layout,
 * l'instance survit à la navigation entre pages : les listeners globaux restent
 * branchés et la file de matchmaking côté serveur reste valide.
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const userId = authClient.useSession().data?.user.id
  const [socket, setSocket] = useState<Socket | null>(null);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

  const setInSocketStore = useSocketStore((state) => state.setSocket)
  const clearScoketStore = useSocketStore((state) => state.clearSocket)

  useEffect(() => {
    // Tant que la session n'est pas résolue, ne pas ouvrir de socket : le serveur
    // authentifie chaque action sur `handshake.auth.userId`, une connexion avec
    // un id vide serait rejetée puis remplacée (churn connect/disconnect).
    if (!userId) return

    const socketInstance = io(SOCKET_URL || "http://localhost:3005", {
      auth: { userId }
    });

    setSocket(socketInstance);
    setInSocketStore(socketInstance)

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      clearScoketStore()
    };
  }, [userId, SOCKET_URL, setInSocketStore, clearScoketStore]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};
