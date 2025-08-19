
import React from 'react';
import { Users } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";

interface ConversationAvatarProps {
  avatar: string | null;
  name: string;
  isGroup: boolean;
  hasUnread?: boolean;
}

export const ConversationAvatar: React.FC<ConversationAvatarProps> = ({
  avatar,
  name,
  isGroup,
  hasUnread = false
}) => {
  return (
    <div className="relative">
      {isGroup ? (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground flex items-center justify-center">
          <Users className="h-6 w-6" />
        </div>
      ) : (
        <UserAvatar 
          src={avatar}
          userName={name}
          size="lg"
          hasUnread={hasUnread}
        />
      )}
      {!isGroup && hasUnread && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-background rounded-full"></div>
      )}
    </div>
  );
};
