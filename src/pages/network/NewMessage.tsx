import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, Send, Users, X, UserPlus, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useConversations } from "@/hooks/useConversations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NewMessage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();
  const { findOrCreateConversation } = useConversations();

  // Search for users
  const { data: users, isLoading } = useQuery({
    queryKey: ['userSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, email')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!searchTerm.trim()
  });

  const { data: selectedUserProfiles } = useQuery({
    queryKey: ['selectedUserProfiles', selectedUsers],
    queryFn: async () => {
      if (selectedUsers.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', selectedUsers);

      if (error) throw error;
      return data;
    },
    enabled: selectedUsers.length > 0
  });

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0 || !message.trim()) {
      toast.error('Please select recipients and enter a message');
      return;
    }

    try {
      const conversation = await findOrCreateConversation(selectedUsers);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: message,
          message_type: 'text'
        });

      if (error) throw error;

      toast.success('Message sent successfully!');
      navigate(`/network/messages/${conversation.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const generateInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Premium Header */}
        <div className="flex items-center gap-6 mb-10">
          <Link to="/network/messages">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm hover:bg-slate-50">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">New Message</h1>
            <p className="text-slate-500 font-medium text-lg">Start a professional conversation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Recipient Search Section */}
          <div className="xl:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl font-bold text-slate-800">Find People</CardTitle>
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-slate-50 border-none rounded-2xl text-lg focus-visible:ring-2 focus-visible:ring-blue-500/10 placeholder:text-slate-400"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                  {isLoading ? (
                    <div className="p-10 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-slate-400 font-medium">Searching experts...</p>
                    </div>
                  ) : users && users.length > 0 ? (
                    <div className="divide-y divide-slate-50 px-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user.id)}
                          className={cn(
                            "p-4 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-200 group",
                            selectedUsers.includes(user.id) 
                              ? "bg-blue-600 shadow-lg shadow-blue-200" 
                              : "hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Avatar className="w-14 h-14 ring-2 ring-white shadow-sm">
                                <AvatarImage src={user.profile_picture_url} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                  {generateInitials(user.full_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              {selectedUsers.includes(user.id) && (
                                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={cn(
                                "font-bold truncate text-[16px]",
                                selectedUsers.includes(user.id) ? "text-white" : "text-slate-900"
                              )}>
                                {user.full_name || 'Professional User'}
                              </h3>
                              <p className={cn(
                                "text-sm truncate",
                                selectedUsers.includes(user.id) ? "text-blue-100" : "text-slate-500"
                              )}>
                                {user.title || "Career Professional"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchTerm.trim() ? (
                    <div className="p-16 text-center">
                      <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No professionals found for "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium max-w-[200px] mx-auto">
                        Start typing to find experts in your network
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Message Composition Section */}
          <div className="xl:col-span-7">
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-blue-900/5 bg-white overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-6 bg-slate-50/50">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  Compose
                  {selectedUsers.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-black">
                      {selectedUsers.length} SELECTED
                    </span>
                  )}
                </CardTitle>
                
                {/* Modern Recipient List */}
                {selectedUsers.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedUserProfiles?.map((user) => (
                        <div 
                          key={user.id} 
                          className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-xl shadow-sm animate-in fade-in zoom-in duration-200"
                        >
                          <Avatar className="w-6 h-6 ring-1 ring-slate-100">
                            <AvatarImage src={user.profile_picture_url} />
                            <AvatarFallback className="text-[10px] font-bold bg-slate-50">
                              {generateInitials(user.full_name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-bold text-slate-700">{user.full_name}</span>
                          <button
                            onClick={() => handleUserSelect(user.id)}
                            className="ml-1 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                       <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          "rounded-xl h-10 px-4 font-bold transition-all",
                          isGroup ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-100"
                        )}
                        onClick={() => setIsGroup(!isGroup)}
                        disabled={selectedUsers.length < 2}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {isGroup ? 'Group Chat' : 'Individual'}
                      </Button>
                      
                      {isGroup && (
                        <Input
                          placeholder="Name your group..."
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="h-10 bg-white border-slate-100 rounded-xl"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-6 border-2 border-dashed border-slate-100 rounded-[1.5rem] flex items-center justify-center">
                    <p className="text-slate-400 text-sm font-medium italic">Select a recipient to start writing</p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="px-8 py-8 space-y-6">
                <Textarea
                  placeholder="Share your thoughts, ask a question, or start a collaboration..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[300px] bg-slate-50/30 border-none rounded-[1.5rem] p-6 text-lg focus-visible:ring-1 focus-visible:ring-slate-100 resize-none shadow-inner"
                />
                
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      message.length > 900 ? "bg-red-500" : "bg-blue-500"
                    )} />
                    <span className="text-sm font-bold text-slate-400 tracking-wide uppercase">
                      {message.length} / 1000
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={selectedUsers.length === 0 || !message.trim()}
                    className="h-16 px-10 rounded-[1.25rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-2xl shadow-blue-200 transition-all active:scale-95 group"
                  >
                    Send Message
                    <Send className="h-6 w-6 ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMessage;
