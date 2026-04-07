import { io } from 'socket.io-client';
import { getBackendUrl } from './utils';

const BACKEND_URL = getBackendUrl();

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export const connectSocket = () => socket.connect();
export const disconnectSocket = () => socket.disconnect();
