import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';

interface ChatMessage {
  id: string;
  familyGroupId: number;
  userId: number;
  userName: string;
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'emoji';
  timestamp: Date;
  reactions: Record<string, number>;
}

interface ChatRoom {
  familyGroupId: number;
  members: Set<string>;
  messages: ChatMessage[];
}

export class RealtimeChatManager {
  private io: SocketIOServer;
  private rooms: Map<number, ChatRoom> = new Map();

  constructor(httpServer: Server) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Chat] User connected: ${socket.id}`);

      // Join family chat room
      socket.on('join-chat', (data: { familyGroupId: number; userId: number; userName: string }) => {
        const roomName = `family-${data.familyGroupId}`;
        socket.join(roomName);

        const room = this.rooms.get(data.familyGroupId) || {
          familyGroupId: data.familyGroupId,
          members: new Set(),
          messages: [],
        };
        room.members.add(socket.id);
        this.rooms.set(data.familyGroupId, room);

        // Notify others that user joined
        this.io.to(roomName).emit('user-joined', {
          userId: data.userId,
          userName: data.userName,
          memberCount: room.members.size,
        });

        console.log(`[Chat] User ${data.userName} joined family ${data.familyGroupId}`);
      });

      // Send message
      socket.on(
        'send-message',
        (data: {
          familyGroupId: number;
          userId: number;
          userName: string;
          content: string;
          messageType: string;
        }) => {
          const roomName = `family-${data.familyGroupId}`;
          const message: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random()}`,
            familyGroupId: data.familyGroupId,
            userId: data.userId,
            userName: data.userName,
            content: data.content,
            messageType: data.messageType as 'text' | 'image' | 'audio' | 'emoji',
            timestamp: new Date(),
            reactions: {},
          };

          // Store message
          const room = this.rooms.get(data.familyGroupId);
          if (room) {
            room.messages.push(message);
            // Keep only last 100 messages
            if (room.messages.length > 100) {
              room.messages.shift();
            }
          }

          // Broadcast to room
          this.io.to(roomName).emit('new-message', message);
          console.log(`[Chat] Message from ${data.userName}: ${data.content.substring(0, 50)}`);
        }
      );

      // Add reaction
      socket.on(
        'add-reaction',
        (data: { familyGroupId: number; messageId: string; emoji: string }) => {
          const roomName = `family-${data.familyGroupId}`;
          const room = this.rooms.get(data.familyGroupId);

          if (room) {
            const message = room.messages.find((m) => m.id === data.messageId);
            if (message) {
              message.reactions[data.emoji] = (message.reactions[data.emoji] || 0) + 1;
              this.io.to(roomName).emit('reaction-added', {
                messageId: data.messageId,
                emoji: data.emoji,
                count: message.reactions[data.emoji],
              });
            }
          }
        }
      );

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`[Chat] User disconnected: ${socket.id}`);
        // Clean up rooms
        this.rooms.forEach((room) => {
          room.members.delete(socket.id);
        });
      });
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public getRoomMessages(familyGroupId: number): ChatMessage[] {
    return this.rooms.get(familyGroupId)?.messages || [];
  }
}
