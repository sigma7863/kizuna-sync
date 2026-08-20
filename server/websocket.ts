import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

export interface RippleNotification {
  userId: number;
  familyGroupId: number;
  activityType: "walking" | "photo" | "music" | "location" | "mood" | "message";
  userName: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface RealtimeLocationUpdate {
  userId: number;
  userName: string;
  familyGroupId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName?: string;
  timestamp: number;
}

export interface RealtimeNotification {
  id: number;
  userId: number;
  familyGroupId: number;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  quiet: boolean;
  createdAt: Date;
}

interface ConnectedUser {
  socketId: string;
  userId: number;
  familyGroupIds: number[];
}

const connectedUsers = new Map<number, ConnectedUser>();
const familyGroupSockets = new Map<number, Set<string>>();

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? undefined : "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] User connected: ${socket.id}`);

    socket.on("user:join", (data: { userId: number; familyGroupIds: number[] }) => {
      const { userId, familyGroupIds } = data;
      connectedUsers.set(userId, { socketId: socket.id, userId, familyGroupIds });
      familyGroupIds.forEach((groupId) => {
        if (!familyGroupSockets.has(groupId)) familyGroupSockets.set(groupId, new Set());
        familyGroupSockets.get(groupId)!.add(socket.id);
        socket.join(`family:${groupId}`);
      });
      console.log(`[WebSocket] User ${userId} joined family groups: ${familyGroupIds.join(",")}`);
    });

    socket.on("ripple:send", (notification: RippleNotification) => {
      io.to(`family:${notification.familyGroupId}`).emit("ripple:receive", {
        ...notification,
        timestamp: Date.now(),
      });
    });

    socket.on("activity:update", (data: { familyGroupId: number; userId: number; activity: unknown }) => {
      io.to(`family:${data.familyGroupId}`).emit("activity:updated", {
        userId: data.userId,
        activity: data.activity,
        timestamp: Date.now(),
      });
    });

    socket.on("timeline:update", (data: { familyGroupId: number; entry: unknown }) => {
      io.to(`family:${data.familyGroupId}`).emit("timeline:updated", {
        entry: data.entry,
        timestamp: Date.now(),
      });
    });

    socket.on("notification:read", (data: { familyGroupId: number; notificationId: number }) => {
      socket.to(`family:${data.familyGroupId}`).emit("notification:read", {
        notificationId: data.notificationId,
        timestamp: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      for (const [userId, user] of Array.from(connectedUsers.entries())) {
        if (user.socketId === socket.id) {
          connectedUsers.delete(userId);
          user.familyGroupIds.forEach((groupId) => {
            const sockets = familyGroupSockets.get(groupId);
            sockets?.delete(socket.id);
            if (sockets?.size === 0) familyGroupSockets.delete(groupId);
          });
          break;
        }
      }
    });

    socket.on("error", (error: unknown) => {
      console.error("[WebSocket] Socket error:", error);
    });
  });

  return io;
}

export function broadcastRipple(io: SocketIOServer, notification: RippleNotification) {
  io.to(`family:${notification.familyGroupId}`).emit("ripple:receive", {
    ...notification,
    timestamp: Date.now(),
  });
}

export function broadcastTimelineUpdate(io: SocketIOServer, familyGroupId: number, entry: unknown) {
  io.to(`family:${familyGroupId}`).emit("timeline:updated", {
    entry,
    timestamp: Date.now(),
  });
}

export function broadcastNotification(io: SocketIOServer, notification: RealtimeNotification) {
  io.to(`family:${notification.familyGroupId}`).emit("notification:receive", notification);
}

export function broadcastLocationUpdate(io: SocketIOServer, update: RealtimeLocationUpdate) {
  io.to(`family:${update.familyGroupId}`).emit("location:updated", { ...update, timestamp: Date.now() });
}
