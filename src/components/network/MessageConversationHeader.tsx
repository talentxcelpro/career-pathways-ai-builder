
import React from 'react';
import { Link } from 'react-router-dom';
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
    <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/network/people/${otherUser?.id}`} className="hover:scale-105 transition-transform">
            <div className="relative">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                <AvatarImage src={otherUser?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm">
                  {generateInitials(otherUser)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </Link>
          <div>
            <Link 
              to={`/network/people/${otherUser?.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              <h3 className="font-semibold text-sm cursor-pointer text-gray-900">
                {formatDisplayName(otherUser)}
              </h3>
            </Link>
            <p className="text-gray-600 text-xs">
              {otherUser?.title || 'Professional'}
            </p>
            <p className="text-xs text-green-600 flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              Active now
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 transition-colors">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 transition-colors">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-8 w-8 p-0 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageConversationHeader;
