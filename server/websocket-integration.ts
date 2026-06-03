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

export function broadcastRippleNotification(notification: Parameters<typeof broadcastRipple>[1]) {
  if (!io) return;
  broadcastRipple(io, notification);
}

export function broadcastTimelineUpdateNotification(
  familyGroupId: number,
  entry: Parameters<typeof broadcastTimelineUpdate>[2]
) {
  if (!io) return;
  broadcastTimelineUpdate(io, familyGroupId, entry);
}
