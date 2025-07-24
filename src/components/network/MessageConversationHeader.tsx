
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Phone, Video, MoreVertical, Minus, Square, X, User, Settings, Archive } from "lucide-react";

interface MessageConversationHeaderProps {
  otherUser: any;
  formatDisplayName: (profile: any) => string;
  generateInitials: (profile: any) => string;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isUserOnline?: boolean;
}

const MessageConversationHeader: React.FC<MessageConversationHeaderProps> = ({
  otherUser,
  formatDisplayName,
  generateInitials,
  isMinimized = false,
  onMinimize,
  onMaximize,
  onClose,
  isUserOnline = true
}) => {
  return (
    <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2">
      <div className="flex items-center justify-between">
        {/* macOS-style window controls */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group"
              title="Close"
            >
              <X className="w-1.5 h-1.5 text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={onMinimize}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center group"
              title="Minimize"
            >
              <Minus className="w-1.5 h-1.5 text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={onMaximize}
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center group"
              title="Maximize"
            >
              <Square className="w-1.5 h-1.5 text-green-800 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* User info - centered */}
        <div className="flex items-center space-x-2 flex-1 justify-center">
          <Link to={`/network/people/${otherUser?.id}`} className="hover:scale-105 transition-transform">
            <div className="relative">
              <Avatar className="h-6 w-6 ring-1 ring-white shadow-sm">
                <AvatarImage src={otherUser?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-xs">
                  {generateInitials(otherUser)}
                </AvatarFallback>
              </Avatar>
              {/* Online status indicator - always show green for now */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
            </div>
          </Link>
          <div className="text-center">
            <Link 
              to={`/network/people/${otherUser?.id}`}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              <h3 className="font-medium text-xs text-gray-900 truncate max-w-32 hover:underline">
                {formatDisplayName(otherUser)}
              </h3>
            </Link>
            <div className="flex items-center justify-center space-x-1">
              <p className="text-gray-600 text-xs truncate max-w-24">
                {otherUser?.title || 'Professional'}
              </p>
              <div className="flex items-center">
                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`text-xs font-medium ${isUserOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {isUserOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-0.5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-0 transition-colors"
            onClick={() => {
              // TODO: Implement voice call functionality
              alert('Voice call feature coming soon!');
            }}
            title="Voice call"
          >
            <Phone className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-0 transition-colors"
            onClick={() => {
              // TODO: Implement video call functionality  
              alert('Video call feature coming soon!');
            }}
            title="Video call"
          >
            <Video className="h-3 w-3" />
          </Button>
          
          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-6 w-6 p-0 transition-colors">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg z-50"
              sideOffset={5}
            >
              <DropdownMenuItem asChild className="hover:bg-gray-100 focus:bg-gray-100">
                <Link to={`/network/people/${otherUser?.id}`} className="flex items-center px-4 py-2 text-sm text-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem asChild className="hover:bg-gray-100 focus:bg-gray-100">
                <Link to="/network/messages/settings" className="flex items-center px-4 py-2 text-sm text-gray-700">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Message Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100 focus:bg-gray-100 px-4 py-2 text-sm text-gray-700">
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MessageConversationHeader;
