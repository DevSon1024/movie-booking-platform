import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: true,
  withCredentials: true,
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
}

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
}
