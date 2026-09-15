import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Phone, Video, MoreVertical, X, User, Settings, Archive, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
  isUserOnline = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        {/* Left side: Back + User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-slate-100 h-10 w-10 shrink-0"
            onClick={() => navigate('/network/messages')}
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>

          <Link 
            to={`/user/${otherUser?.id}`} 
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all">
                <AvatarImage src={otherUser?.profile_picture_url} />
                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                  {generateInitials(otherUser)}
                </AvatarFallback>
              </Avatar>
              {isUserOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                {formatDisplayName(otherUser)}
              </h3>
              <p className="text-xs text-slate-500 truncate font-medium">
                {isUserOnline ? 'Online' : 'Recently active'}
              </p>
            </div>
          </Link>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
            onClick={() => alert('Voice call feature coming soon!')}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
            onClick={() => alert('Video call feature coming soon!')}
          >
            <Video className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-full h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100">
              <DropdownMenuItem asChild className="rounded-xl">
                <Link to={`/user/${otherUser?.id}`} className="flex items-center px-3 py-2 text-sm">
                  <User className="mr-3 h-4 w-4 text-slate-500" />
                  <span className="font-medium">View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-50 mx-2 my-2" />
              <DropdownMenuItem asChild className="rounded-xl">
                <Link to="/network/messages/settings" className="flex items-center px-3 py-2 text-sm">
                  <Settings className="mr-3 h-4 w-4 text-slate-500" />
                  <span className="font-medium">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-600">
                <Archive className="mr-3 h-4 w-4" />
                <span className="font-medium">Archive Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MessageConversationHeader;
