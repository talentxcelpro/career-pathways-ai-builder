import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus,
  Settings,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';

export const NetworkMessagingSidebar = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();

  if (!isVisible || !user) return null;

  const recentConversations = conversations?.slice(0, 5) || [];

  return (
    <Card className={`fixed right-4 bottom-4 shadow-lg border-0 bg-white/95 backdrop-blur-sm transition-all duration-300 z-50 ${
      isMinimized ? 'w-16 h-16' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          {!isMinimized && (
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Messages
            </CardTitle>
          )}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content - only show when not minimized */}
      {!isMinimized && (
        <>
          <CardContent className="p-3 flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recentConversations.length > 0 ? (
              <div className="space-y-2">
                {recentConversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    to={`/network/messages/${conversation.id}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.png" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Chat {conversation.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Recent conversation
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <MessageSquare className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">No messages yet</p>
                  <p className="text-xs text-gray-500">Start a conversation</p>
                </div>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50/50">
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link to="/network/messages/new">
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link to="/network/messages">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  All
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};