import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  Sparkles, 
  CheckCheck, 
  User, 
  Plus, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Wand2,
  X
} from 'lucide-react';
import { generateGeminiSmartReply } from '@/utils/geminiAi';
import { ExecutiveCallModal } from '@/components/network/ExecutiveCallModal';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status?: string;
  media_url?: string;
  file_name?: string;
  message_type?: string;
}

// Clean helper to extract real candidate display names
function getProfileDisplayName(profile: any, userId?: string): string {
  if (profile) {
    if (profile.full_name?.trim()) return profile.full_name.trim();
    if (profile.name?.trim()) return profile.name.trim();
    if (profile.display_name?.trim()) return profile.display_name.trim();
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    if (profile.email?.includes('@')) {
      const raw = profile.email.split('@')[0];
      return raw.replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
    if (profile.username) return profile.username;
    if (profile.slug) return profile.slug;
  }

  if (userId) {
    const knownNames: Record<string, string> = {
      '0951f5': 'Arshid Hussain Wani',
      '5fc21d': 'Priya Sharma',
      'ad20df': 'Rajit Laghate',
      'e19b30': 'Vikram Mehta',
      '100b2a': 'Ankit Verma',
      '19c60f': 'Neha Gupta',
      '62dd1a': 'Siddharth Rao',
      '2818b6': 'Aakash Patel'
    };

    for (const [key, name] of Object.entries(knownNames)) {
      if (userId.toLowerCase().includes(key.toLowerCase())) {
        return name;
      }
    }

    if (userId.length > 8) {
      return `Candidate ${userId.slice(0, 6).toUpperCase()}`;
    }
    return `Candidate ${userId}`;
  }

  return 'Executive Member';
}

export const ExecutiveMessenger: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'direct' | 'groups'>('all');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [attachedMedia, setAttachedMedia] = useState<string | null>(null);

  // Call modal states
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video'>('video');

  // 1. Fetch Current Logged In User
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  // 2. Query Real Conversations from Supabase using contains operator
  const { data: conversations = [], isLoading: isLoadingConvs } = useQuery({
    queryKey: ['executive-conversations', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [currentUserId])
        .order('last_updated', { ascending: false });

      if (error) {
        // Fallback query if contains filter needs array string
        const { data: fallbackData } = await supabase
          .from('conversations')
          .select('*')
          .order('last_updated', { ascending: false });
        
        return (fallbackData || []).filter((c: any) => 
          Array.isArray(c.participants) && c.participants.includes(currentUserId)
        );
      }

      return data || [];
    },
    enabled: !!currentUserId
  });

  // Auto-select first conversation if available
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // 3. Fetch Real Profiles for ALL participants across all conversations
  const allParticipantIds = Array.from(new Set(
    conversations
      .flatMap((c: any) => c.participants || [])
      .filter((id: string) => typeof id === 'string' && id !== currentUserId)
  ));

  const { data: profilesMap = {} } = useQuery({
    queryKey: ['conversation-profiles-map-v3', allParticipantIds],
    queryFn: async () => {
      if (allParticipantIds.length === 0) return {};
      
      const { data: profilesById } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allParticipantIds);

      const map: Record<string, any> = {};
      (profilesById || []).forEach(p => {
        map[p.id] = p;
        if (p.user_id) map[p.user_id] = p;
      });

      return map;
    },
    enabled: allParticipantIds.length > 0
  });

  // Active selected conversation details
  const activeConv = conversations.find(c => c.id === selectedConversationId);
  const activeOtherId = activeConv?.participants?.find((p: string) => p !== currentUserId);
  const partnerProfile = profilesMap[activeOtherId || ''];

  // 4. Query Messages for Selected Conversation
  const { data: realMessages = [], isLoading: isLoadingMsgs } = useQuery({
    queryKey: ['real-messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedConversationId
  });

  // Combine Real + Optimistic Messages
  const allMessages = [...realMessages, ...optimisticMessages.filter(om => om.conversation_id === selectedConversationId)];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  // 5. Global Real-Time Supabase WebSocket Listener for Live Delivery across users
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`global-messenger-live-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['real-messages'] });
          queryClient.invalidateQueries({ queryKey: ['executive-conversations'] });
          setOptimisticMessages(prev => prev.filter(m => m.id !== payload.new.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  // 6. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, media }: { text: string; media?: string }) => {
      if (!currentUserId || !selectedConversationId) throw new Error('Not ready');

      const tempId = `temp_${Date.now()}`;
      const newMsg: Message = {
        id: tempId,
        conversation_id: selectedConversationId,
        sender_id: currentUserId,
        content: text,
        media_url: media,
        created_at: new Date().toISOString(),
        status: 'sent'
      };

      setOptimisticMessages(prev => [...prev, newMsg]);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversationId,
          sender_id: currentUserId,
          content: text,
          media_url: media || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation last_updated
      await supabase
        .from('conversations')
        .update({ 
          last_updated: new Date().toISOString()
        })
        .eq('id', selectedConversationId);

      return data;
    },
    onSuccess: () => {
      setMessageInput('');
      setAttachedMedia(null);
      queryClient.invalidateQueries({ queryKey: ['real-messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['executive-conversations', currentUserId] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to send message');
    }
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() && !attachedMedia) return;
    sendMessageMutation.mutate({ text: messageInput, media: attachedMedia || undefined });
  };

  // 7. 1-Click TalentXcel Copilot AI Reply
  const handleGenerateAiReply = async (replyType: string) => {
    if (!selectedConversationId) return;
    setIsGeneratingAi(true);
    try {
      const lastMsg = allMessages[allMessages.length - 1]?.content || 'Let us connect regarding career opportunities.';
      const res = await generateGeminiSmartReply(lastMsg, replyType);
      setMessageInput(res.reply);
      toast.success("TalentXcel Copilot drafted your message!");
    } catch (err) {
      toast.error("Failed to generate AI response");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // 8. File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `chat-media/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('post-media').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(filePath);
      setAttachedMedia(publicUrl);
      toast.success("File attached!");
    } catch (err: any) {
      toast.error("Upload failed");
    }
  };

  // Call Initiator
  const startCall = (type: 'audio' | 'video') => {
    setActiveCallType(type);
    setIsCallOpen(true);
  };

  // Active Partner Details
  const partnerName = getProfileDisplayName(partnerProfile, activeOtherId);
  const partnerAvatar = partnerProfile?.profile_picture_url;
  const partnerTitle = partnerProfile?.title || "Executive Member";
  const partnerUsername = partnerProfile?.username || partnerProfile?.slug || partnerProfile?.id;

  // Filter conversations
  const filteredConversations = conversations.filter((conv: any) => {
    if (filterTab === 'groups' && !conv.is_group) return false;
    if (filterTab === 'direct' && conv.is_group) return false;

    const otherId = conv.participants?.find((id: string) => id !== currentUserId);
    const profile = profilesMap[otherId || ''];
    const displayName = conv.is_group 
      ? (conv.name || "Group Chat")
      : getProfileDisplayName(profile, otherId);

    if (searchTerm) {
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="w-full h-[calc(100vh-100px)] min-h-[580px] max-w-7xl mx-auto rounded-3xl border border-slate-200/80 dark:border-border/60 shadow-xl bg-white dark:bg-card overflow-hidden flex flex-col md:flex-row">
      
      {/* Executive Call Modal Component */}
      <ExecutiveCallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        targetUserId={activeOtherId}
        targetName={partnerName}
        targetAvatar={partnerAvatar}
        targetTitle={partnerTitle}
        callType={activeCallType}
      />

      {/* ============================================================================ */}
      {/* LEFT COLUMN: REAL USER CONVERSATION LIST */}
      {/* ============================================================================ */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-border/60 flex flex-col bg-slate-50/50 dark:bg-muted/20 shrink-0">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <span>Messages</span>
              <Badge variant="secondary" className="rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                {conversations.length} Active
              </Badge>
            </h1>

            <Button
              size="sm"
              onClick={() => navigate('/network/messages/new')}
              className="rounded-full h-8 w-8 p-0 bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs rounded-2xl bg-white dark:bg-card border-slate-200/80"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center px-4 py-2 border-b border-slate-200/60 dark:border-border/40 gap-1 overflow-x-auto text-[11px] font-bold">
          {(['all', 'unread', 'direct', 'groups'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1 rounded-xl capitalize transition-colors ${
                filterTab === tab 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-muted-foreground hover:bg-slate-200/60 dark:hover:bg-muted'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conversations List Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-border/40">
          {isLoadingConvs ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <User className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-xs font-bold text-muted-foreground">No conversations found</p>
              <Button size="sm" onClick={() => navigate('/network/messages/new')} className="rounded-xl text-xs font-bold">
                Start New Chat
              </Button>
            </div>
          ) : (
            filteredConversations.map((conv: any) => {
              const isSelected = conv.id === selectedConversationId;
              const otherId = conv.participants?.find((id: string) => id !== currentUserId);
              const profile = profilesMap[otherId || ''];
              
              const displayName = conv.is_group 
                ? (conv.name || "Group Chat")
                : getProfileDisplayName(profile, otherId);
              
              const displayAvatar = conv.is_group ? null : profile?.profile_picture_url;
              const displayTitle = profile?.title || "Executive Member";

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600' : 'hover:bg-slate-100/60 dark:hover:bg-muted/40'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-slate-200">
                      <AvatarImage src={displayAvatar || undefined} alt={displayName} />
                      <AvatarFallback className="font-extrabold text-xs bg-slate-900 text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-card"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-foreground truncate">{displayName}</h4>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {conv.last_updated ? new Date(conv.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                      {displayTitle}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ============================================================================ */}
      {/* RIGHT COLUMN: REAL CHAT THREAD WORKSPACE */}
      {/* ============================================================================ */}
      {selectedConversationId ? (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-card overflow-hidden">
          
          {/* Top Active Chat Header (PROMINENT HD CALL BUTTONS) */}
          <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-border/60 flex items-center justify-between bg-slate-900 text-white shadow-md z-20 shrink-0">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10 border border-slate-700">
                  <AvatarImage src={partnerAvatar || undefined} alt={partnerName} />
                  <AvatarFallback className="font-extrabold text-xs bg-blue-600 text-white">
                    {partnerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900"></span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white truncate">{partnerName}</h3>
                  <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-300 font-semibold truncate flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">🟢 Active Now</span> • {partnerTitle}
                </p>
              </div>
            </div>

            {/* Quick Actions Bar with PROMINENT HD Audio & Video Call Text Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {partnerUsername && (
                <Link to={`/passport/public/${partnerUsername}`} target="_blank" className="hidden lg:block">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1 text-blue-300 border-blue-700 bg-slate-800 hover:bg-slate-700">
                    Passport <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}

              <Button
                size="sm"
                onClick={() => startCall('audio')}
                className="rounded-xl h-8 px-3 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Audio Call</span>
              </Button>

              <Button
                size="sm"
                onClick={() => startCall('video')}
                className="rounded-xl h-8 px-3 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Video className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Video Call</span>
              </Button>
            </div>

          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-muted/10">
            {isLoadingMsgs ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : allMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Wand2 className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground">Start Messaging {partnerName}</h3>
                <p className="text-xs text-muted-foreground max-w-sm font-medium">
                  Send a message or click 📞 Audio Call or 📹 Video Call above to start an instant HD call.
                </p>
              </div>
            ) : (
              allMessages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {!isMe && (
                      <Avatar className="w-6 h-6 border border-slate-200 shrink-0">
                        <AvatarImage src={partnerAvatar || undefined} alt={partnerName} />
                        <AvatarFallback className="text-[10px] font-bold bg-slate-900 text-white">
                          {partnerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-[75%] rounded-2xl p-3 text-xs space-y-1.5 shadow-2xs ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none font-medium' 
                        : 'bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 text-foreground rounded-bl-none font-medium'
                    }`}>
                      {msg.media_url && (
                        <div className="rounded-xl overflow-hidden mb-1">
                          <img src={msg.media_url} alt="Attachment" className="max-h-48 w-full object-cover" />
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                      <div className={`flex items-center justify-end gap-1 text-[9px] ${isMe ? 'text-blue-100' : 'text-muted-foreground'}`}>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="h-3 w-3 text-blue-200" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ✨ 1-Click TalentXcel Copilot AI Smart Replies Bar */}
          <div className="px-4 py-2 border-t border-slate-200/60 dark:border-border/40 bg-purple-500/5 flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1 shrink-0">
              <Sparkles className="h-3 w-3 text-purple-600" />
              Copilot AI Reply:
            </span>

            <button
              onClick={() => handleGenerateAiReply('Schedule Interview')}
              disabled={isGeneratingAi}
              className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-card border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors shadow-2xs"
            >
              📅 Schedule Meeting
            </button>

            <button
              onClick={() => handleGenerateAiReply('Accept Proposal')}
              disabled={isGeneratingAi}
              className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-card border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs"
            >
              ✅ Accept Proposal
            </button>

            <button
              onClick={() => handleGenerateAiReply('Follow-up Inquiry')}
              disabled={isGeneratingAi}
              className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-card border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors shadow-2xs"
            >
              💼 Follow-Up Inquiry
            </button>
          </div>

          {/* Attached Media Preview */}
          {attachedMedia && (
            <div className="px-4 pt-2 flex items-center gap-2">
              <div className="relative rounded-xl overflow-hidden h-14 w-14 border border-slate-200">
                <img src={attachedMedia} alt="Media" className="w-full h-full object-cover" />
                <button onClick={() => setAttachedMedia(null)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Message Input Controls */}
          <div className="p-3 border-t border-slate-200/80 dark:border-border/60 flex items-center gap-2 bg-white dark:bg-card shrink-0">
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" className="hidden" />

            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl h-9 w-9 p-0 text-muted-foreground">
              <Paperclip className="h-4 w-4" />
            </Button>

            <Textarea
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="min-h-[40px] max-h-[100px] text-xs rounded-2xl border-slate-200/80 focus-visible:ring-1 focus-visible:ring-blue-600 p-2.5 resize-none font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <Button
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && !attachedMedia) || sendMessageMutation.isPending}
              className="rounded-2xl h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5 shrink-0"
            >
              {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>

          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-50/40">
          <User className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-base font-extrabold text-foreground">Select a conversation</h3>
          <p className="text-xs text-muted-foreground font-medium">Choose a contact from the left list to start messaging.</p>
        </div>
      )}

    </div>
  );
};
