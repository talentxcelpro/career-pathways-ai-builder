
import React from 'react';
import { Link } from 'react-router-dom';
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, MoreVertical } from "lucide-react";

interface MessageConversationHeaderProps {
  otherUser: any;
  formatDisplayName: (profile: any) => string;
  generateInitials: (profile: any) => string;
}

const MessageConversationHeader: React.FC<MessageConversationHeaderProps> = ({
  otherUser,
  formatDisplayName,
  generateInitials
}) => {
  return (
    <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to={`/network/people/${otherUser?.id}`} className="hover:scale-105 transition-transform">
            <div className="relative">
              <Avatar className="h-6 w-6 ring-1 ring-white/20">
                <AvatarImage src={otherUser?.profile_picture_url} />
                <AvatarFallback className="bg-white/20 text-white font-semibold text-xs">
                  {generateInitials(otherUser)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
            </div>
          </Link>
          <div>
            <Link 
              to={`/network/people/${otherUser?.id}`}
              className="hover:text-blue-200 transition-colors"
            >
              <h3 className="font-semibold text-xs cursor-pointer">
                {formatDisplayName(otherUser)}
              </h3>
            </Link>
            <p className="text-blue-100 text-xs">
              {otherUser?.title || 'Professional'}
            </p>
            <p className="text-xs text-blue-200 flex items-center">
              <span className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse"></span>
              Active now
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6 w-6 p-0">
            <Phone className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6 w-6 p-0">
            <Video className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6 w-6 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default MessageConversationHeader;
