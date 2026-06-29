import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '../services/auth';

interface EnergyStatus {
  current: number;
  max: number;
  timeToNextMs: number;
  regenTimePerHeartMs: number;
  refillCostGems: number;
}

export function useEnergySocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [energyStatus, setEnergyStatus] = useState<EnergyStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const connectSocket = async () => {
      try {
        const token = await getAccessToken();
        if (!token || !isMounted) return;

        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const newSocket = io(`${apiUrl}/energy`, {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
          if (isMounted) {
            setIsConnected(true);
            newSocket.emit('energy:subscribe');
          }
        });

        newSocket.on('disconnect', () => {
          if (isMounted) setIsConnected(false);
        });

        newSocket.on('energy:status', (data: EnergyStatus) => {
          if (isMounted) setEnergyStatus(data);
        });

        newSocket.on('energy:updated', (data: EnergyStatus) => {
          if (isMounted) setEnergyStatus(data);
        });

        newSocket.on('error', (error) => {
          console.error('Energy socket error:', error);
        });

        if (isMounted) {
          setSocket(newSocket);
        }
      } catch (error) {
        console.error('Error connecting to energy socket:', error);
      }
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return { socket, energyStatus, isConnected };
}
