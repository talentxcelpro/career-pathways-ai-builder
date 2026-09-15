import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WhatsAppBubble } from "@/components/mobile/WhatsAppBubble";

interface MessagesListProps {
  messages: any[];
  isLoading: boolean;
  currentUserId: string | null;
  otherUser: any;
  isTyping: boolean;
  formatTime: (dateString: string) => string;
  formatDisplayName: (profile: any) => string;
  generateInitials: (profile: any) => string;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isLoading,
  currentUserId,
  otherUser,
  isTyping,
  formatTime,
  formatDisplayName,
  generateInitials
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 bg-[#E5DDD5] dark:bg-slate-900 overflow-hidden relative">
      {/* WhatsApp-style Background Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />
      
      <ScrollArea ref={scrollAreaRef} className="h-full relative z-10">
        <div className="px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-medium">Decrypting messages...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 min-h-[400px] flex flex-col">
              <div className="flex-1"></div>
              
              {messages?.map((message: any, index: number) => {
                const isOwn = message.sender_id === currentUserId;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                const isRead = message.is_read || false;
                
                return (
                  <WhatsAppBubble
                    key={message.id}
                    content={message.content}
                    timestamp={formatTime(message.created_at)}
                    isOwn={isOwn}
                    status={isRead ? 'read' : 'delivered'}
                  />
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start mb-2 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-end space-x-2">
                    <Avatar className="h-8 w-8 shadow-sm">
                      <AvatarImage src={otherUser?.profile_picture_url} />
                      <AvatarFallback className="bg-white text-slate-400 text-xs font-bold">
                        {generateInitials(otherUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 shadow-sm border border-slate-100">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessagesList;
