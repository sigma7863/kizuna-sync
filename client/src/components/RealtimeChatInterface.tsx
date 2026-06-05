import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Smile, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  userName: string;
  content: string;
  messageType: 'text' | 'emoji';
  timestamp: Date;
  reactions: Record<string, number>;
}

interface RealtimeChatInterfaceProps {
  familyGroupId: number;
  userName: string;
  userId: number;
}

const EMOJI_REACTIONS = ['😊', '❤️', '😂', '🎉', '👍', '🔥'];

export function RealtimeChatInterface({
  familyGroupId,
  userName,
  userId,
}: RealtimeChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [memberCount, setMemberCount] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock Socket.IO connection
  useEffect(() => {
    // In production, this would connect to Socket.IO server
    console.log(`[Chat] Connecting to family ${familyGroupId}`);

    // Simulate receiving a message
    const timer = setTimeout(() => {
      const mockMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        userName: 'Family Bot',
        content: 'リアルタイムチャットへようこそ！',
        messageType: 'text',
        timestamp: new Date(),
        reactions: {},
      };
      setMessages((prev) => [...prev, mockMessage]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [familyGroupId]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        userName,
        content: inputValue,
        messageType: 'text',
        timestamp: new Date(),
        reactions: {},
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputValue('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userName,
      content: emoji,
      messageType: 'emoji',
      timestamp: new Date(),
      reactions: {},
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowEmojiPicker(false);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: {
              ...msg.reactions,
              [emoji]: (msg.reactions[emoji] || 0) + 1,
            },
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h2 className="font-bold text-lg">家族チャット</h2>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-sm">{memberCount}人</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.messageType === 'emoji' ? 'justify-center' : msg.userName === userName ? 'justify-end' : 'justify-start'}`}
            >
              {msg.messageType === 'emoji' ? (
                <div className="text-3xl animate-bounce">{msg.content}</div>
              ) : (
                <Card
                  className={`max-w-xs px-4 py-2 ${
                    msg.userName === userName
                      ? 'bg-pink-100 border-pink-300'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-700">{msg.userName}</p>
                  <p className="text-sm text-gray-800 mt-1">{msg.content}</p>

                  {/* Reactions */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="text-xs bg-white rounded-full px-2 py-1 hover:bg-gray-200 transition-colors"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                    {Object.keys(msg.reactions).length === 0 && (
                      <div className="flex gap-1">
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="text-xs bg-white rounded-full px-2 py-1 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </Card>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">チャットを開始しましょう！</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {showEmojiPicker && (
          <div className="flex gap-2 flex-wrap bg-gray-50 p-3 rounded">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="メッセージを入力..."
            className="flex-1"
          />
          <Button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            variant="outline"
            size="icon"
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            className="bg-pink-500 hover:bg-pink-600 text-white"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
