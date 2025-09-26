import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Send, Phone, Video, MoreVertical, 
  Search, Plus, MessageSquare, Users,
  Paperclip, Smile, Check, CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const {
    messages,
    chatRooms,
    activeRoom,
    isLoading,
    isTyping,
    connectToRoom,
    sendMessage,
    sendTypingIndicator
  } = useRealTimeChat();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeRoom) return;

    await sendMessage(messageInput, activeRoom);
    setMessageInput('');
    sendTypingIndicator(activeRoom, false);
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    
    if (activeRoom) {
      sendTypingIndicator(activeRoom, value.length > 0);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(activeRoom, false);
      }, 1000);
    }
  };

  const filteredChatRooms = chatRooms.filter(room => 
    room.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.id.includes(searchQuery)
  );

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getMessageStatus = (message: any) => {
    if (message.sender_id !== user?.id) return null;
    return message.is_read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-muted-foreground" />;
  };

  const currentTypingUsers = Object.entries(isTyping)
    .filter(([userId, typing]) => typing && userId !== user?.id)
    .map(([userId]) => userId);

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Rooms Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredChatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => connectToRoom(room.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  activeRoom === room.id 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted/50"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/api/placeholder/40/40`} />
                  <AvatarFallback>
                    {room.room_type === 'group' ? <Users className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">
                      {room.room_name || `Chat ${room.id.slice(0, 8)}`}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {room.last_message ? formatMessageTime(room.last_message.created_at) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {room.last_message?.content || 'No messages yet'}
                  </p>
                </div>
                {room.unread_count > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {room.unread_count}
                  </Badge>
                )}
              </div>
            ))}

            {filteredChatRooms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations found</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Start a new chat
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>
                      <MessageSquare className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Chat Room</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentTypingUsers.length > 0 
                        ? `${currentTypingUsers.length} user(s) typing...`
                        : 'Online'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.sender_id === user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender_avatar} />
                        <AvatarFallback>
                          {message.sender_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        message.sender_id === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.sender_id !== user?.id && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {message.sender_name}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(message.created_at)}
                        </span>
                        {getMessageStatus(message)}
                      </div>
                    </div>
                    {message.sender_id === user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/api/placeholder/32/32" />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-10"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};