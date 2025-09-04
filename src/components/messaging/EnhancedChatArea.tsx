import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Phone, Video, MoreVertical, Send, Paperclip, Smile, 
  Image, File, Mic, ThumbsUp, Reply, Forward, 
  MessageSquare, Check, CheckCheck 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';
import MediaPreview from "@/components/posts/MediaPreview";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EnhancedChatAreaProps {
  selectedConversation: string | null;
  messages: any[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  selectedConversation,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isLoading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [messageMode, setMessageMode] = useState<'text' | 'voice'>('text');

  // Get the profile of the selected conversation user
  const { data: conversationProfile } = useQuery({
    queryKey: ['conversationProfile', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, profile_picture_url, title, 
          current_company, location, is_online, last_seen
        `)
        .eq('id', selectedConversation)
        .single();

      if (error) {
        console.error('Error fetching conversation profile:', error);
        return null;
      }

      return profile;
    },
    enabled: !!selectedConversation
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const getOnlineStatus = () => {
    if (conversationProfile?.is_online) {
      return <span className="text-green-500">● Online</span>;
    }
    if (conversationProfile?.last_seen) {
      const lastSeen = new Date(conversationProfile.last_seen);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return <span className="text-yellow-500">● Active recently</span>;
      if (diffHours < 24) return <span className="text-gray-400">● Last seen {diffHours}h ago</span>;
      return <span className="text-gray-400">● Last seen {Math.floor(diffHours / 24)}d ago</span>;
    }
    return <span className="text-gray-400">● Offline</span>;
  };

  if (!selectedConversation) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="flex items-center justify-center h-full min-h-[600px]">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Select a conversation
            </h3>
            <p className="text-muted-foreground">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/network/people/${selectedConversation}`} className="hover:scale-105 transition-transform">
              <Avatar className="cursor-pointer h-12 w-12">
                <AvatarImage src={conversationProfile?.profile_picture_url} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  {generateInitials(conversationProfile)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link 
                to={`/network/people/${selectedConversation}`}
                className="hover:text-primary transition-colors"
              >
                <h3 className="font-semibold cursor-pointer text-lg">
                  {formatDisplayName(conversationProfile)}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground">
                {conversationProfile?.title || 'Professional'}
                {conversationProfile?.current_company && (
                  <span> · {conversationProfile.current_company}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {getOnlineStatus()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="h-9 w-9">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9">
              <Video className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    View Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Archive Chat
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm text-destructive">
                    Block User
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-4">
            {messages?.map((message: any, index: number) => {
              const isOwn = message.sender_id !== selectedConversation;
              const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isOwn && showAvatar && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={conversationProfile?.profile_picture_url} />
                      <AvatarFallback className="text-xs bg-muted">
                        {generateInitials(conversationProfile)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isOwn && !showAvatar && <div className="w-8" />}
                  
                  <div className={`max-w-[70%] group ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-2 relative ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                      onDoubleClick={() => setSelectedMessage(message.id)}
                    >
                      <MediaPreview content={message.content} isMessage={true} />
                      
                      <div className={`flex items-center gap-2 mt-1 text-xs ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span>{formatTime(message.created_at)}</span>
                        {isOwn && (
                          <div className="flex items-center">
                            {message.is_read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Message actions on hover */}
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 mt-1 ${
                      isOwn ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Reply className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Forward className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={conversationProfile?.profile_picture_url} />
                  <AvatarFallback className="text-xs bg-muted">
                    {generateInitials(conversationProfile)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 bg-card">
          <div className="flex items-end space-x-2">
            <div className="flex space-x-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <Image className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <File className="h-4 w-4 mr-2" />
                      Document
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Note
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="ghost" size="sm" className="h-9 w-9">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              {messageMode === 'text' ? (
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[40px] max-h-[120px] resize-none"
                  disabled={isLoading}
                />
              ) : (
                <div className="flex items-center justify-center h-10 bg-muted rounded-md">
                  <Mic className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">Recording...</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
              className="h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};