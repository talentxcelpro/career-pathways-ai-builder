import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Input } from '@/components/ui/input';
import { 
  Send, Phone, Video, MoreVertical, ArrowLeft, 
  Smile, Mic, Camera, Plus, Search, Archive, 
  CheckCircle2, Users, MessageSquare 
} from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useCommunication } from '@/hooks/useCommunication';
import { WhatsAppBubble } from './WhatsAppBubble';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type FilterType = 'all' | 'unread' | 'groups';

export const MobileMessaging: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { conversations, messages, sendMessage, isLoading, isSendingMessage } = useCommunication();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChat) {
      scrollToBottom();
    }
  }, [messages, activeChat]);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    return conversations.filter(conv => {
      // Search filter
      const matchesSearch = conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           conv.participants?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // Type filter
      if (activeFilter === 'unread') return conv.unread_count > 0;
      if (activeFilter === 'groups') return conv.is_group;
      
      return true;
    });
  }, [conversations, searchQuery, activeFilter]);

  const activeMessages = useMemo(() => {
    if (!activeChat || !messages) return [];
    // If it's a direct message, filter by participant
    // In a real app, use the conversation_id from the hook
    return messages.filter(m => 
      m.conversation_id === activeChat.id || 
      m.receiver_id === activeChat.id || 
      m.sender_id === activeChat.id
    );
  }, [messages, activeChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    triggerHaptic('light');
    const content = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage({ 
        conversationId: activeChat.id, 
        content 
      });
      triggerHaptic('success');
    } catch (error) {
      console.error('Failed to send message:', error);
      triggerHaptic('error');
    }
  };

  const ChatList = () => (
    <div className="h-full bg-[#F8F9FA] flex flex-col">
      {/* Premium Header */}
      <div className="bg-white px-6 pt-8 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Messages</h1>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-blue-200">
              PRO
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="rounded-full bg-slate-50 text-slate-600">
              <Archive className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="primary" className="rounded-full shadow-lg shadow-blue-200">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Professional Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-slate-50 border-none rounded-2xl text-[15px] focus-visible:ring-2 focus-visible:ring-blue-500/20 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 pb-2">
          {(['all', 'unread', 'groups'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                triggerHaptic('light');
                setActiveFilter(filter);
              }}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                activeFilter === filter 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                  : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
              )}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'unread' && conversations?.some(c => c.unread_count > 0) && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {conversations.filter(c => c.unread_count > 0).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No conversations yet</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              Start connecting with your professional network to see messages here.
            </p>
            <Button className="mt-8 rounded-xl px-8 h-12 font-bold shadow-lg shadow-blue-100">
              Start a Conversation
            </Button>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                triggerHaptic('medium');
                setActiveChat(conv);
              }}
              className="w-full p-4 bg-white rounded-3xl flex items-center gap-4 hover:bg-blue-50/50 transition-all duration-200 active:scale-[0.98] shadow-sm border border-slate-50"
            >
              <div className="relative">
                <UserAvatar 
                  src={conv.avatar || "/placeholder-avatar.png"}
                  userName={conv.name || conv.participants?.[0] || "User"}
                  size="lg"
                  className="ring-2 ring-white"
                />
                {conv.is_online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-slate-900 truncate text-[16px]">
                    {conv.name || conv.participants?.[0] || "Unknown"}
                  </p>
                  <span className="text-xs font-medium text-slate-400">
                    {conv.last_updated ? format(new Date(conv.last_updated), 'HH:mm') : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-slate-500 truncate max-w-[180px]">
                    {conv.messages?.content || "No messages yet"}
                  </p>
                  {conv.unread_count > 0 && (
                    <div className="bg-blue-600 text-white min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-black px-1.5 shadow-sm">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const ChatView = () => (
    <div className="h-full flex flex-col bg-[#E5DDD5] relative overflow-hidden">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveChat(null)}
            className="rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
          <div className="flex items-center gap-3">
            <UserAvatar 
              src={activeChat.avatar || "/placeholder-avatar.png"}
              userName={activeChat.name || activeChat.participants?.[0]}
              size="sm"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-[15px] truncate">
                {activeChat.name || activeChat.participants?.[0]}
              </h4>
              <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">
                {activeChat.is_online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="rounded-full text-slate-600">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full text-slate-600">
            <Phone className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full text-slate-600">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages with WhatsApp Wallpaper Pattern */}
      <div 
        className="flex-1 overflow-y-auto py-6 space-y-1 relative"
        style={{ 
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px'
        }}
      >
        <div className="absolute inset-0 bg-[#E5DDD5] opacity-90 z-0" />
        
        <div className="relative z-10 flex flex-col">
          {activeMessages.map((msg, idx) => (
            <WhatsAppBubble
              key={msg.id}
              content={msg.content}
              timestamp={format(new Date(msg.created_at), 'HH:mm')}
              isMe={msg.sender_id === activeChat.participants?.[0]} // This is a simplification for demo
              status={msg.status || 'read'}
              senderName={activeChat.is_group ? "Participant" : undefined}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern Input */}
      <div className="p-4 bg-[#F0F2F5] border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-3 z-10">
              <Smile className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full pl-10 pr-10 h-11 bg-white border-none rounded-full text-[15px] focus-visible:ring-1 focus-visible:ring-slate-200 shadow-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <div className="absolute right-3 z-10">
              <Camera className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center justify-center">
            {newMessage.trim() ? (
              <Button 
                onClick={handleSendMessage}
                size="icon"
                className="bg-[#00A884] hover:bg-[#008F6F] rounded-full w-11 h-11 shadow-md transition-transform active:scale-90"
                disabled={isSendingMessage}
              >
                <Send className="w-5 h-5 text-white" />
              </Button>
            ) : (
              <Button 
                size="icon"
                variant="ghost"
                className="bg-white hover:bg-slate-50 rounded-full w-11 h-11 shadow-sm text-slate-500 transition-transform active:scale-90"
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("h-full font-sans antialiased overflow-hidden", className)}>
      {activeChat ? <ChatView /> : <ChatList />}
    </div>
  );
};

