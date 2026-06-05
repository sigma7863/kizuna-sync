import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Smile, Paperclip, Trash2 } from 'lucide-react';

interface ChatMessage {
  id: number;
  userName: string;
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'emoji';
  attachmentUrl?: string;
  createdAt: Date;
  reactions: Record<string, number>;
}

interface FamilyChatBoxProps {
  familyGroupId: number;
  messages?: ChatMessage[];
  onSendMessage?: (content: string, type: string) => void;
}

const EMOJI_REACTIONS = ['😊', '❤️', '😂', '🎉', '👍', '🔥'];

export function FamilyChatBox({
  familyGroupId,
  messages = [],
  onSendMessage,
}: FamilyChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage?.(inputValue, 'text');
      setInputValue('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onSendMessage?.(emoji, 'emoji');
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.messageType === 'emoji' ? 'justify-center' : ''}`}
            >
              {msg.messageType === 'emoji' ? (
                <div className="text-3xl">{msg.content}</div>
              ) : (
                <Card className="max-w-xs px-3 py-2 bg-pink-50 border-pink-200">
                  <p className="text-xs font-semibold text-pink-700">{msg.userName}</p>
                  <p className="text-sm text-gray-800 mt-1">{msg.content}</p>
                  {msg.attachmentUrl && (
                    <img
                      src={msg.attachmentUrl}
                      alt="attachment"
                      className="mt-2 rounded w-full max-w-xs"
                    />
                  )}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        className="text-xs bg-white rounded-full px-2 py-1 hover:bg-gray-100"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
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
            <p className="text-sm">メッセージがまだありません</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {showEmojiPicker && (
          <div className="flex gap-2 flex-wrap">
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
          <Button variant="outline" size="icon">
            <Paperclip className="w-4 h-4" />
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
