import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Input } from '@/components/ui/input';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Smile, Mic, Camera, Plus } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice';
  status: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface MobileMessagingProps {
  className?: string;
}

export const MobileMessaging: React.FC<MobileMessagingProps> = ({ className = '' }) => {
  const [chats] = useState<Chat[]>([
    // Empty for now - will be populated with real data from backend
  ]);

  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    // Will be populated with real chat messages
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();
  const { sync, isOnline } = useRealtimeSync();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    triggerHaptic('light');
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Sync with backend
    await sync('messages', { chatId: activeChat.id, message });
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    triggerHaptic('medium');
    // Start voice recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    triggerHaptic('success');
    // Stop and send voice message
  };

  const ChatList = () => (
    <div className="h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <h1 className="text-lg font-semibold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {chats.filter(chat => chat.unreadCount > 0).length} unread conversations
        </p>
      </div>

      {/* Chat List */}
      <div className="divide-y divide-border">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start networking and connect with professionals to begin conversations
            </p>
          </div>
        ) : (
          chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className="w-full p-4 flex items-center space-x-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="relative">
                <UserAvatar 
                  src={chat.participant.avatar}
                  userName={chat.participant.name}
                  size="lg"
                />
                {chat.participant.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {chat.participant.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {chat.lastMessage.timestamp}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {chat.participant.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate flex-1">
                    {chat.lastMessage.senderId === 'me' ? 'You: ' : ''}
                    {chat.lastMessage.content}
                  </p>
                  {chat.unreadCount > 0 && (
                    <div className="ml-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const ChatView = () => {
    if (!activeChat) return null;

    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveChat(null)}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <UserAvatar 
                src={activeChat.participant.avatar}
                userName={activeChat.participant.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activeChat.participant.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeChat.participant.isOnline ? 'Online' : `Last seen ${activeChat.participant.lastSeen}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.senderId === 'me'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                  {message.senderId === 'me' && (
                    <div className="ml-2">
                      <div className={`w-3 h-3 rounded-full ${
                        message.status === 'read' ? 'bg-green-400' :
                        message.status === 'delivered' ? 'bg-gray-400' :
                        'bg-gray-300'
                      }`} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Camera className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="pr-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-primary hover:bg-primary/90"
                disabled={!isOnline}
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={`text-muted-foreground ${isRecording ? 'bg-red-500 text-white' : ''}`}
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
          {!isOnline && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Reconnecting... Messages will be sent when online
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full ${className}`}>
      {activeChat ? <ChatView /> : <ChatList />}
    </div>
  );
};