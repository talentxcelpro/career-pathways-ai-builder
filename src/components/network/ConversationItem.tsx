
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { ConversationAvatar } from './ConversationAvatar';
import { ConversationMetadata } from './ConversationMetadata';

interface ConversationItemProps {
  conversation: any;
  displayName: string;
  displayAvatar: string | null;
  displayTitle?: string;
  isGroup: boolean;
  lastMessage?: any;
  hasUnread?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  displayName,
  displayAvatar,
  displayTitle,
  isGroup,
  lastMessage,
  hasUnread = false
}) => {
  return (
    <Link
      to={`/network/messages/${conversation.id}`}
      className="block p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start space-x-3">
        <ConversationAvatar
          avatar={displayAvatar}
          name={displayName}
          isGroup={isGroup}
          hasUnread={hasUnread}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">
                {displayName}
              </h3>
              {isGroup && (
                <Badge variant="secondary" className="text-xs">
                  {conversation.participants?.length || 0}
                </Badge>
              )}
            </div>
            <ConversationMetadata
              timestamp={lastMessage ? lastMessage.created_at : conversation.created_at}
            />
          </div>
          
          {!isGroup && displayTitle && (
            <p className="text-sm text-gray-600 mb-1 truncate">
              {displayTitle}
            </p>
          )}
          
          {lastMessage && (
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500 truncate flex-1">
                {lastMessage.message_type === 'text' 
                  ? lastMessage.content 
                  : `📎 ${lastMessage.message_type}`
                }
              </p>
              {hasUnread && (
                <Badge variant="default" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  3
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
