import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { broadcastRipple, broadcastTimelineUpdate, initializeWebSocket } from './websocket';

let io: SocketIOServer | null = null;

export function initializeWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (!io) {
    io = initializeWebSocket(httpServer);
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
