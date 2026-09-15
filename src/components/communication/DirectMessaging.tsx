import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Plus, MoreVertical, ChevronLeft, Zap, Shield, Phone, Video, Radio, MessageSquare, Activity, Globe, Lock, ArrowLeft } from "lucide-react";
import { useCommunication } from "@/hooks/useCommunication";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DirectMessaging = () => {
  const { user } = useAuth();
  const { conversations, messages, sendMessage, isLoading } = useCommunication();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    try {
      await sendMessage({ conversationId: selectedConversation, content: newMessage.trim() });
      setNewMessage('');
    } catch (error) { console.error('Failed to send message:', error); }
  };

  const filteredConversations = conversations?.filter(conv => 
    searchQuery === '' || 
    conv.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const selectedMessages = selectedConversation ? 
    messages?.filter(m => m.receiver_id === selectedConversation || m.sender_id === selectedConversation) || [] : [];

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    if (window.innerWidth < 768) setShowMobileList(false);
  };

  return (
    <div className="flex h-full w-full bg-slate-50/50 backdrop-blur-3xl overflow-hidden rounded-[48px]">
      {/* Contact Directory */}
      <AnimatePresence mode="wait">
        {(showMobileList || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
              "flex flex-col border-r border-slate-200/50 bg-white/40 backdrop-blur-2xl transition-all duration-500",
              "w-full md:w-80 lg:w-96",
              !showMobileList && "hidden md:flex"
            )}
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Messages</h1>
                  <p className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest mt-1">Professional Directory</p>
                </div>
                <Button size="icon" className="h-11 w-11 rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/20 hover:scale-105 transition-all">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/60 border-slate-100 rounded-2xl font-apple-bold text-slate-950 placeholder:text-slate-300 focus:border-blue-500/50 shadow-sm"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 pb-8">
              <div className="space-y-2">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-6 animate-pulse flex gap-4 bg-white/40 rounded-[32px]">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                      </div>
                    </div>
                  ))
                ) : filteredConversations.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100/50 rounded-[32px] flex items-center justify-center mx-auto">
                      <MessageSquare className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-xs font-apple-heavy text-slate-400 uppercase tracking-widest">No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation.id)}
                      className={cn(
                        "w-full p-6 flex items-center gap-4 rounded-[32px] transition-all duration-300 group",
                        selectedConversation === conversation.id 
                          ? "bg-slate-950 text-white shadow-2xl scale-[1.02]" 
                          : "hover:bg-white hover:shadow-xl hover:-translate-y-0.5"
                      )}
                    >
                      <div className="relative shrink-0">
                        <UserAvatar 
                          src={null}
                          userName={conversation.participants[0]}
                          size="lg"
                          className="rounded-[20px] shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-lg" />
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "font-apple-heavy truncate text-sm",
                            selectedConversation === conversation.id ? "text-white" : "text-slate-950"
                          )}>
                            {conversation.is_group ? conversation.name : conversation.participants[0]}
                          </p>
                          <span className={cn(
                            "text-[9px] font-apple-bold uppercase tracking-widest",
                            selectedConversation === conversation.id ? "text-slate-500" : "text-slate-400"
                          )}>
                            {conversation.messages ? format(new Date(conversation.messages.created_at), 'HH:mm') : ''}
                          </span>
                        </div>
                        <p className={cn(
                          "text-[11px] truncate font-apple-medium leading-relaxed",
                          selectedConversation === conversation.id ? "text-slate-400" : "text-slate-500"
                        )}>
                          {conversation.messages?.content || 'Starting new conversation...'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Area: Message Interface */}
      <div className={cn(
        "flex-1 flex flex-col bg-white/20 backdrop-blur-sm relative",
        showMobileList && "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            {/* Interface Header */}
            <header className="h-24 px-8 border-b border-slate-200/50 flex items-center justify-between bg-white/60 backdrop-blur-3xl sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden rounded-2xl hover:bg-slate-100"
                  onClick={() => setShowMobileList(true)}
                >
                  <ArrowLeft className="h-6 w-6 text-slate-950" />
                </Button>
                
                <div className="flex items-center gap-4">
                  <UserAvatar 
                    src={null}
                    userName="Contact"
                    size="lg"
                    className="rounded-[20px] shadow-xl border-2 border-white"
                  />
                  <div>
                    <h2 className="text-lg font-apple-heavy text-slate-950 tracking-tight">Professional Message</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[9px] font-apple-heavy text-emerald-600 uppercase tracking-widest">Securely Connected</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:text-slate-950 hover:bg-slate-50">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:text-slate-950 hover:bg-slate-50">
                  <Video className="h-5 w-5" />
                </Button>
                <div className="w-px h-8 bg-slate-100 mx-2" />
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:text-slate-950">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* History */}
            <ScrollArea className="flex-1 px-8 py-10">
              <div className="max-w-4xl mx-auto space-y-10 pb-8">
                <div className="flex justify-center">
                  <Badge className="bg-slate-50 text-slate-400 border border-slate-100 rounded-full text-[9px] px-6 py-1 font-apple-bold tracking-widest uppercase">
                    Message History
                  </Badge>
                </div>

                <AnimatePresence initial={false}>
                  {selectedMessages.map((message, idx) => {
                    const isMe = message.sender_id === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={cn(
                          "flex group",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[75%] md:max-w-[60%] space-y-2",
                          isMe ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "p-6 shadow-xl relative transition-all duration-500",
                            isMe 
                              ? "bg-slate-950 text-white rounded-[32px] rounded-tr-none shadow-slate-950/10" 
                              : "bg-white border border-slate-100 text-slate-950 rounded-[32px] rounded-tl-none shadow-slate-200/50"
                          )}>
                            <p className="text-sm font-apple-medium leading-relaxed">{message.content}</p>
                          </div>
                          <p className={cn(
                            "text-[8px] font-apple-heavy text-slate-400 uppercase tracking-widest px-2",
                            isMe ? "text-right" : "text-left"
                          )}>
                            {format(new Date(message.created_at), 'HH:mm')} • {isMe ? 'Sent' : 'Received'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-8 bg-white/60 backdrop-blur-3xl border-t border-slate-200/50">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-950 transition-all">
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
                
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full h-16 pl-16 pr-24 bg-white border-slate-100 rounded-[28px] font-apple-heavy text-slate-950 placeholder:text-slate-300 focus:border-blue-500/50 shadow-2xl shadow-slate-200/50 transition-all"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    className={cn(
                      "h-12 w-12 rounded-2xl transition-all duration-500 shadow-xl",
                      newMessage.trim() ? "bg-blue-600 text-white scale-100 shadow-blue-500/20" : "bg-slate-100 text-slate-300 scale-90"
                    )}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-3 text-[9px] font-apple-heavy text-slate-400 uppercase tracking-widest">
                  <Lock className="h-3 w-3" /> End-to-End Encryption Enabled
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/30">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md text-center space-y-10"
            >
              <div className="relative h-32 w-32 mx-auto">
                 <div className="absolute inset-0 bg-blue-600/10 rounded-[40px] animate-pulse" />
                 <div className="absolute inset-4 bg-blue-600/5 rounded-[32px] animate-ping" />
                 <div className="relative h-full w-full bg-slate-950 rounded-[40px] shadow-2xl flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-white" />
                 </div>
              </div>
              <div>
                <h3 className="text-3xl font-apple-heavy text-slate-950 tracking-tighter mb-4">Start a Conversation</h3>
                <p className="text-sm font-apple-medium text-slate-500 leading-relaxed px-8">
                  Connect with other professionals and experts. All communications are private and secure.
                </p>
              </div>
              <div className="flex items-center justify-center gap-12 pt-4">
                 <div className="text-center space-y-1">
                    <div className="text-2xl font-apple-heavy text-slate-950 tracking-tighter">0.1ms</div>
                    <div className="text-[9px] font-apple-bold text-slate-400 uppercase tracking-widest">LATENCY</div>
                 </div>
                 <div className="w-px h-10 bg-slate-200" />
                 <div className="text-center space-y-1">
                    <div className="text-2xl font-apple-heavy text-slate-950 tracking-tighter">E2E</div>
                    <div className="text-[9px] font-apple-bold text-slate-400 uppercase tracking-widest">ENCRYPTION</div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessaging;