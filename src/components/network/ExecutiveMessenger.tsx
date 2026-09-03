import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

// Helper to extract real display name strictly from Supabase user profiles
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

  if (userId && userId.length > 6) {
    return `User ${userId.slice(0, 6).toUpperCase()}`;
  }

  return 'Professional Member';
}

export const ExecutiveMessenger: React.FC = () => {
  const navigate = useNavigate();
  const { id: routeConvId } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(routeConvId || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'direct' | 'groups'>('all');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [liveMessagesMap, setLiveMessagesMap] = useState<Record<string, Message[]>>({});
  const [attachedMedia, setAttachedMedia] = useState<string | null>(null);

  // Call modal states
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video'>('video');
  const [incomingCallData, setIncomingCallData] = useState<any>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  // 1. Fetch Current Logged In User
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  // Fetch Current User Profile Identity
  const { data: myProfile } = useQuery({
    queryKey: ['my-profile-identity-v2', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .maybeSingle();

      if (data) return data;

      const { data: fallback } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      return fallback;
    },
    enabled: !!currentUserId
  });

  const myDisplayName = getProfileDisplayName(myProfile, currentUserId || undefined);
  const myAvatar = myProfile?.profile_picture_url;
  const myTitle = myProfile?.title || "Executive Member";

  // 2. Query REAL Conversations from Supabase Database
  const { data: conversations = [], isLoading: isLoadingConvs } = useQuery({
    queryKey: ['real-user-conversations-v3', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data: convData, error } = await supabase
        .from('conversations')
        .select('*')
        .filter('participants', 'cs', `{${currentUserId}}`)
        .order('last_updated', { ascending: false });

      if (error) return [];
      return convData || [];
    },
    enabled: !!currentUserId
  });

  // Auto-select route params or first conversation
  useEffect(() => {
    if (routeConvId) {
      setSelectedConversationId(routeConvId);
    } else if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [routeConvId, conversations, selectedConversationId]);

  // 3. Fetch Real Profiles from Supabase with Safe Dual Promise Queries
  const allParticipantIds = Array.from(new Set(
    conversations
      .flatMap((c: any) => c.participants || [])
      .filter((id: string) => typeof id === 'string' && id !== currentUserId)
  ));

  const { data: profilesMap = {} } = useQuery({
    queryKey: ['real-user-profiles-map-v3', allParticipantIds],
    queryFn: async () => {
      if (allParticipantIds.length === 0) return {};
      
      // Dual query to safely match both id and user_id without PostgREST syntax errors
      const [resById, resByUserId] = await Promise.all([
        supabase.from('profiles').select('*').in('id', allParticipantIds),
        supabase.from('profiles').select('*').in('user_id', allParticipantIds)
      ]);

      const allProfiles = [...(resById.data || []), ...(resByUserId.data || [])];
      const map: Record<string, any> = {};

      allProfiles.forEach(p => {
        if (p.id) map[p.id] = p;
        if (p.user_id) map[p.user_id] = p;
      });

      return map;
    },
    enabled: allParticipantIds.length > 0
  });

  // Active selected conversation details
  const activeConv = conversations.find(c => c.id === selectedConversationId);
  const activeOtherId = activeConv?.participants?.find((p: string) => p !== currentUserId);
  const partnerProfile = profilesMap[activeOtherId || ''] || profilesMap[selectedConversationId || ''];
  const partnerName = activeConv?.is_group 
    ? (activeConv.name || "Group Chat") 
    : getProfileDisplayName(partnerProfile, activeOtherId);
  const partnerAvatar = partnerProfile?.profile_picture_url;
  const partnerTitle = partnerProfile?.title || "Executive Member";
  const partnerUsername = partnerProfile?.username || partnerProfile?.slug || partnerProfile?.id;

  // 4. Query REAL Messages from Supabase for Selected Conversation
  const { data: dbMessages = [], isLoading: isLoadingMsgs } = useQuery({
    queryKey: ['real-user-messages-v3', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, conversation_id, created_at, sender_id, recipient_id, message_type, status')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });

      if (error) return [];
      return data || [];
    },
    enabled: !!selectedConversationId
  });

  // Merge Database Messages + Live Broadcast Messages
  const currentLiveMsgs = (selectedConversationId ? liveMessagesMap[selectedConversationId] : []) || [];
  const allMessagesMap = new Map<string, Message>();
  
  dbMessages.forEach(m => allMessagesMap.set(m.id, m));
  currentLiveMsgs.forEach(m => allMessagesMap.set(m.id, m));

  const allMessages = Array.from(allMessagesMap.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  // 5. Ultra-Reliable Supabase Broadcast Engine (0ms Latency Chat & Video Call Signaling)
  useEffect(() => {
    if (!currentUserId) return;

    const messagingBus = supabase.channel('talentxcel-global-broadcast-v1', {
      config: { broadcast: { self: true } }
    });

    messagingBus
      .on('broadcast', { event: 'CLIENT_SEND_MSG' }, (payload: any) => {
        const msg: Message = payload.payload;
        if (msg && msg.conversation_id) {
          setLiveMessagesMap(prev => ({
            ...prev,
            [msg.conversation_id]: [...(prev[msg.conversation_id] || []), msg]
          }));
          queryClient.invalidateQueries({ queryKey: ['real-user-conversations-v3'] });
        }
      })
      .on('broadcast', { event: 'CLIENT_CALL_INVITE' }, (payload: any) => {
        const callData = payload.payload;
        if (callData && callData.targetUserId === currentUserId) {
          const cId = callData.callId || `call_${Date.now()}`;
          setActiveCallId(cId);
          setIncomingCallData(callData);
          setActiveCallType(callData.callType || 'video');
          setIsCallOpen(true);
          toast.info(`Incoming ${callData.callType === 'audio' ? 'Voice' : 'HD Video'} call from ${callData.callerName}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagingBus);
    };
  }, [currentUserId, queryClient]);

  // 6. Send Message Mutation with 0ms Broadcast Dispatch
  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, media }: { text: string; media?: string }) => {
      if (!currentUserId || !selectedConversationId) throw new Error('Not ready');

      const tempId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const newMsg: Message = {
        id: tempId,
        conversation_id: selectedConversationId,
        sender_id: currentUserId,
        content: text,
        media_url: media,
        created_at: new Date().toISOString(),
        status: 'sent'
      };

      // 1. Instant 0ms Local UI Update
      setLiveMessagesMap(prev => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), newMsg]
      }));

      // 2. High-speed WebSocket Broadcast to Partner (0ms Latency)
      supabase.channel('talentxcel-global-broadcast-v1').send({
        type: 'broadcast',
        event: 'CLIENT_SEND_MSG',
        payload: newMsg
      });

      // 3. Persist to Supabase Database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          id: tempId,
          conversation_id: selectedConversationId,
          sender_id: currentUserId,
          content: text,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) console.warn('DB Save Notice:', error.message);

      // Update conversation last_updated
      await supabase
        .from('conversations')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', selectedConversationId);

      return newMsg;
    },
    onSuccess: () => {
      setMessageInput('');
      setAttachedMedia(null);
      queryClient.invalidateQueries({ queryKey: ['real-user-messages-v3', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['real-user-conversations-v3', currentUserId] });
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
      toast.success(`Copilot drafted: ${replyType}`);
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
        textarea?.focus();
      }, 50);
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

  // Call Initiator with Real-Time WebSockets Signaling
  const startCall = (type: 'audio' | 'video') => {
    if (!activeOtherId) return;
    
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setActiveCallId(callId);
    setActiveCallType(type);
    setIncomingCallData(null);
    setIsCallOpen(true);

    // Broadcast incoming call signal with REAL caller name, avatar, and title
    supabase.channel('talentxcel-global-broadcast-v1').send({
      type: 'broadcast',
      event: 'CLIENT_CALL_INVITE',
      payload: {
        callId,
        callerId: currentUserId,
        callerName: myDisplayName,
        callerAvatar: myAvatar,
        callerTitle: myTitle,
        targetUserId: activeOtherId,
        callType: type
      }
    });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv: any) => {
    if (filterTab === 'groups' && !conv.is_group) return false;
    if (filterTab === 'direct' && conv.is_group) return false;

    const otherId = conv.participants?.find((id: string) => id !== currentUserId);
    const profile = profilesMap[otherId || ''] || profilesMap[conv.id];
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
        onClose={() => {
          setIsCallOpen(false);
          setIncomingCallData(null);
          setActiveCallId(null);
        }}
        callId={incomingCallData?.callId || activeCallId || undefined}
        currentUserId={currentUserId}
        targetUserId={incomingCallData ? incomingCallData.callerId : activeOtherId}
        targetName={incomingCallData ? incomingCallData.callerName : partnerName}
        targetAvatar={incomingCallData ? incomingCallData.callerAvatar : partnerAvatar}
        targetTitle={incomingCallData ? incomingCallData.callerTitle : partnerTitle}
        callType={activeCallType}
        isIncoming={!!incomingCallData}
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
              const profile = profilesMap[otherId || ''] || profilesMap[conv.id];
              
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
              onClick={() => handleGenerateAiReply('Schedule Meeting')}
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
              onClick={() => handleGenerateAiReply('Follow-Up Inquiry')}
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
