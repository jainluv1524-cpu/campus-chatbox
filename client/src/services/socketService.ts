import { io, Socket } from 'socket.io-client';

// Connect to the Socket.IO server
// Uses the backend URL from environment or defaults to localhost
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
const socket: Socket = io(socketUrl, {
  transports: ['websocket'],
  auth: {
    // In a real app, would send JWT token for authentication
    token: localStorage.getItem('token')
  }
});

// Export singleton socket instance
export default socket;

// Helper functions for messaging events
export const sendMessage = (conversationId: string, senderId: string, receiverId: string, content: string, imageUrl?: string, fileUrl?: string) => {
  socket.emit('send-message', {
    conversationId,
    senderId,
    receiverId,
    content,
    imageUrl,
    fileUrl
  });
};

export const subscribeToMessages = (conversationId: string, callback: (message: any) => void) => {
  socket.on(`message-${conversationId}`, callback);
  return () => {
    socket.off(`message-${conversationId}`);
  };
};

export const subscribeNewMessage = (conversationId: string, callback: (message: any) => void) => {
  socket.on(`new-message-${conversationId}`, callback);
  return () => {
    socket.off(`new-message-${conversationId}`);
  };
};

export const subscribeTyping = (conversationId: string, callback: (data: { senderId: string; isTyping: boolean }) => void) => {
  socket.on(`typing-${conversationId}`, callback);
  return () => {
    socket.off(`typing-${conversationId}`);
  };
};

export const setOnline = (userId: string) => {
  socket.emit('set-online', userId);
};

export const setOffline = (userId: string) => {
  socket.emit('set-offline', userId);
};

export const subscribeUserStatus = (userId: string, callback: (data: { userId: string; isOnline: boolean }) => void) => {
  socket.on(`user-status-${userId}`, callback);
  return () => {
    socket.off(`user-status-${userId}`);
  };
};

export const disconnectSocket = () => {
  socket.disconnect();
};