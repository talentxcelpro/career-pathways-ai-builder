
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

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
  const generateInitials = (name: string) => {
    if (!name || name === 'Professional User') return 'PU';
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <Avatar className="w-12 h-12">
        <AvatarImage src={avatar || undefined} alt={`${name}'s profile picture`} />
        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          {isGroup ? <Users className="h-6 w-6" /> : generateInitials(name)}
        </AvatarFallback>
      </Avatar>
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};
