import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = () => {
  if (Platform.OS === 'web') return process.env.EXPO_PUBLIC_SOCKET_URL_WEB || 'http://localhost:3001';
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_SOCKET_URL_ANDROID || 'http://10.0.2.2:3001';
  return process.env.EXPO_PUBLIC_SOCKET_URL_IOS || 'http://localhost:3001';
};

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function connectSocket(token: string) {
  const s = getSocket();
  s.auth = { token };
  s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
