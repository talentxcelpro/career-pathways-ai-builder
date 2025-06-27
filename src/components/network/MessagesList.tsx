
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <ScrollArea className="h-full px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages?.map((message: any, index: number) => {
              const isOwn = message.sender_id === currentUserId;
              const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex items-end space-x-2 max-w-[75%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwn && showAvatar && (
                      <Avatar className="h-6 w-6 mb-1 shadow-sm">
                        <AvatarImage src={otherUser?.profile_picture_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                          {generateInitials(otherUser)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isOwn && !showAvatar && <div className="w-6"></div>}
                    
                    <div
                      className={`rounded-xl px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
                        isOwn
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <Avatar className="h-6 w-6 mb-1 shadow-sm">
                    <AvatarImage src={otherUser?.profile_picture_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                      {generateInitials(otherUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 rounded-xl rounded-bl-md px-3 py-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default MessagesList;
