import React, { memo, useRef, useEffect, useCallback, useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MediaPreview from "@/components/posts/MediaPreview";
import { VirtualizedList } from "@/components/performance/VirtualizedList";
import { useTurbo } from "@/hooks/useTurbo";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_urls?: string[];
  sender_name?: string;
  sender_avatar?: string;
}

interface OptimizedMessagesListProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId: string | null;
  otherUser: any;
  isTyping: boolean;
  formatTime: (dateString: string) => string;
  formatDisplayName: (profile: any) => string;
  generateInitials: (profile: any) => string;
  enableVirtualization?: boolean;
}

const MESSAGE_HEIGHT = 80; // Approximate height per message
const CONTAINER_HEIGHT = 400; // Max height for virtualized container

// Memoized message bubble component
const MessageBubble = memo<{
  message: Message;
  isCurrentUser: boolean;
  otherUser: any;
  formatTime: (dateString: string) => string;
  formatDisplayName: (profile: any) => string;
  generateInitials: (profile: any) => string;
}>(({ message, isCurrentUser, otherUser, formatTime, formatDisplayName, generateInitials }) => {
  const displayName = useMemo(() => {
    return isCurrentUser ? 'You' : formatDisplayName(otherUser);
  }, [isCurrentUser, otherUser, formatDisplayName]);

  const initials = useMemo(() => {
    return isCurrentUser ? 'Y' : generateInitials(otherUser);
  }, [isCurrentUser, otherUser, generateInitials]);

  const timeFormatted = useMemo(() => {
    return formatTime(message.created_at);
  }, [message.created_at, formatTime]);

  return (
    <div className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={isCurrentUser ? undefined : otherUser?.profile_picture_url} />
        <AvatarFallback className="text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-lg p-3 ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          {message.media_urls && message.media_urls.length > 0 && (
            <div className="mt-2">
              <MediaPreview
                content={message.content}
                mediaUrls={message.media_urls}
              />
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {displayName} • {timeFormatted}
        </span>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// Typing indicator component
const TypingIndicator = memo<{
  otherUser: any;
  formatDisplayName: (profile: any) => string;
  generateInitials: (profile: any) => string;
}>(({ otherUser, formatDisplayName, generateInitials }) => {
  const displayName = useMemo(() => formatDisplayName(otherUser), [otherUser, formatDisplayName]);
  const initials = useMemo(() => generateInitials(otherUser), [otherUser, generateInitials]);

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={otherUser?.profile_picture_url} />
        <AvatarFallback className="text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg p-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{displayName} is typing</span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

const OptimizedMessagesListComponent: React.FC<OptimizedMessagesListProps> = ({
  messages,
  isLoading,
  currentUserId,
  otherUser,
  isTyping,
  formatTime,
  formatDisplayName,
  generateInitials,
  enableVirtualization = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Performance monitoring
  const { getMetrics } = useTurbo('OptimizedMessagesList');

  // Auto-scroll to bottom with optimization
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame to defer scrolling
    const rafId = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(rafId);
  }, [messages.length, scrollToBottom]);

  // Memoized message renderer for virtualization
  const renderMessage = useCallback((message: Message, index: number) => {
    const isCurrentUser = message.sender_id === currentUserId;
    
    return (
      <div key={message.id} className="p-2">
        <MessageBubble
          message={message}
          isCurrentUser={isCurrentUser}
          otherUser={otherUser}
          formatTime={formatTime}
          formatDisplayName={formatDisplayName}
          generateInitials={generateInitials}
        />
      </div>
    );
  }, [currentUserId, otherUser, formatTime, formatDisplayName, generateInitials]);

  // Memoized messages with performance tracking
  const memoizedMessages = useMemo(() => {
    const start = performance.now();
    const result = messages.slice(); // Create shallow copy for stability
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OptimizedMessagesList] Memoization took ${(end - start).toFixed(2)}ms for ${messages.length} messages`);
    }
    
    return result;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {enableVirtualization && memoizedMessages.length > 20 ? (
        <div className="flex-1">
          <VirtualizedList
            items={memoizedMessages}
            itemHeight={MESSAGE_HEIGHT}
            containerHeight={CONTAINER_HEIGHT}
            renderItem={renderMessage}
            className="w-full"
          />
        </div>
      ) : (
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {memoizedMessages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {memoizedMessages.map((message) => {
                  const isCurrentUser = message.sender_id === currentUserId;
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isCurrentUser={isCurrentUser}
                      otherUser={otherUser}
                      formatTime={formatTime}
                      formatDisplayName={formatDisplayName}
                      generateInitials={generateInitials}
                    />
                  );
                })}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <TypingIndicator
                    otherUser={otherUser}
                    formatDisplayName={formatDisplayName}
                    generateInitials={generateInitials}
                  />
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

// Export with performance comparison
export const OptimizedMessagesList = memo(OptimizedMessagesListComponent, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.messages.length === nextProps.messages.length &&
    prevProps.messages[prevProps.messages.length - 1]?.id === 
    nextProps.messages[nextProps.messages.length - 1]?.id &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isTyping === nextProps.isTyping &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

OptimizedMessagesList.displayName = 'OptimizedMessagesList';