'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authClient } from '../lib/auth-client';
import { redirect } from 'next/navigation';
import UseSearchOpponent from '../sockets/search-opponent';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const user = authClient.useSession()
  const userId = user.data ? user.data?.user.id : ''
  const [socket, setSocket] = useState<Socket | null>(null);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL
  const { setWaitingOpponent } = UseSearchOpponent()

  useEffect(() => {
    const socketInstance = io(SOCKET_URL || "http://localhost:3005", {
      auth: { userId }
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Listener Globals :
  useEffect(() => {
    if (!socket) return

    socket.on('match-found', (roomId) => {
      setWaitingOpponent(false)
      redirect(`/dashboard/battlefield?id=${roomId}`)
    })

    socket.off('match-found')
    
  }, [socket])


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