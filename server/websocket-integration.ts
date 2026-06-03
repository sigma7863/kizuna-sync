import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { broadcastRipple, broadcastTimelineUpdate } from './websocket';

let io: SocketIOServer | null = null;

export function initializeWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? undefined : '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    console.log('[WebSocket] Server initialized');
  }
  return io;
}

export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

export function broadcastRippleNotification(notification: any) {
  if (!io) return;
  broadcastRipple(io, notification);
}

export function broadcastTimelineUpdateNotification(familyGroupId: number, entry: any) {
  if (!io) return;
  broadcastTimelineUpdate(io, familyGroupId, entry);
}
