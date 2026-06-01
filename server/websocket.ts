import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getDb } from './db';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema';

interface RippleNotification {
  userId: number;
  familyGroupId: number;
  activityType: 'walking' | 'photo' | 'music' | 'location' | 'mood' | 'message';
  userName: string;
  timestamp: number;
  metadata?: Record<string, any>;
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
      origin: process.env.NODE_ENV === 'production' ? undefined : '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] User connected: ${socket.id}`);

    // ユーザーが接続時に自分の情報を登録
    socket.on('user:join', (data: { userId: number; familyGroupIds: number[] }) => {
      const { userId, familyGroupIds } = data;

      // ユーザー情報を保存
      connectedUsers.set(userId, {
        socketId: socket.id,
        userId,
        familyGroupIds,
      });

      // 各家族グループにソケットを登録
      familyGroupIds.forEach((groupId: number) => {
        if (!familyGroupSockets.has(groupId)) {
          familyGroupSockets.set(groupId, new Set());
        }
        familyGroupSockets.get(groupId)!.add(socket.id);
        socket.join(`family:${groupId}`);
      });

      console.log(`[WebSocket] User ${userId} joined family groups: ${familyGroupIds.join(',')}`);
    });

    // 波紋通知を送信
    socket.on('ripple:send', (notification: RippleNotification) => {
      console.log(`[WebSocket] Ripple notification from user ${notification.userId}:`, notification.activityType);

      // 該当する家族グループの全メンバーに通知を配信
      io.to(`family:${notification.familyGroupId}`).emit('ripple:receive', {
        ...notification,
        timestamp: Date.now(),
      });
    });

    // リアルタイムアクティビティ更新
    socket.on('activity:update', (data: { familyGroupId: number; userId: number; activity: any }) => {
      io.to(`family:${data.familyGroupId}`).emit('activity:updated', {
        userId: data.userId,
        activity: data.activity,
        timestamp: Date.now(),
      });
    });

    // タイムライン更新通知
    socket.on('timeline:update', (data: { familyGroupId: number; entry: any }) => {
      io.to(`family:${data.familyGroupId}`).emit('timeline:updated', {
        entry: data.entry,
        timestamp: Date.now(),
      });
    });

    // ユーザーが切断時
    socket.on('disconnect', () => {
      console.log(`[WebSocket] User disconnected: ${socket.id}`);

      // 接続ユーザーから削除
      for (const [userId, user] of Array.from(connectedUsers.entries())) {
        if (user.socketId === socket.id) {
          connectedUsers.delete(userId);

          // 家族グループから削除
          user.familyGroupIds.forEach((groupId) => {
            familyGroupSockets.get(groupId)?.delete(socket.id);
          });
          break;
        }
      }
    });

    // エラーハンドリング
    socket.on('error', (error: any) => {
      console.error(`[WebSocket] Socket error:`, error);
    });
  });

  return io;
}

// サーバー側から波紋通知を送信するヘルパー関数
export function broadcastRipple(io: SocketIOServer, notification: RippleNotification) {
  io.to(`family:${notification.familyGroupId}`).emit('ripple:receive', {
    ...notification,
    timestamp: Date.now(),
  });
}

// サーバー側からタイムライン更新を配信するヘルパー関数
export function broadcastTimelineUpdate(io: SocketIOServer, familyGroupId: number, entry: any) {
  io.to(`family:${familyGroupId}`).emit('timeline:updated', {
    entry,
    timestamp: Date.now(),
  });
}
