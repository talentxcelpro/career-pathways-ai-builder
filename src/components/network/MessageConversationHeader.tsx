
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
    <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to={`/network/people/${otherUser?.id}`} className="hover:scale-105 transition-transform">
            <div className="relative">
              <Avatar className="h-6 w-6 ring-1 ring-white shadow-sm">
                <AvatarImage src={otherUser?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-xs">
                  {generateInitials(otherUser)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
            </div>
          </Link>
          <div>
            <Link 
              to={`/network/people/${otherUser?.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              <h3 className="font-medium text-xs cursor-pointer text-gray-900 truncate max-w-32">
                {formatDisplayName(otherUser)}
              </h3>
            </Link>
            <p className="text-gray-600 text-xs truncate max-w-32">
              {otherUser?.title || 'Professional'}
            </p>
          </div>
        </div>
        <div className="flex space-x-0.5">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-0 transition-colors">
            <Phone className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-0 transition-colors">
            <Video className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-6 w-6 p-0 transition-colors">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageConversationHeader;
