import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Sparkles, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const NetworkMessagingSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch active conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['floating-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .filter('participants', 'cs', `{${user.id}}`)
        .order('last_updated', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch profiles for conversation partners
  const partnerIds = Array.from(new Set(
    conversations.flatMap((c: any) => c.participants || []).filter((id: string) => id !== user?.id)
  ));

  const { data: profilesMap = {} } = useQuery({
    queryKey: ['floating-profiles-map', partnerIds],
    queryFn: async () => {
      if (partnerIds.length === 0) return {};
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, email')
        .in('id', partnerIds);

      const map: Record<string, any> = {};
      (profiles || []).forEach(p => {
        map[p.id] = p;
      });
      return map;
    },
    enabled: partnerIds.length > 0
  });

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 shadow-2xl rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-white" />
              <h3 className="text-xs font-extrabold tracking-tight">Executive Messenger</h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate('/network/messages')} className="text-white/80 hover:text-white text-[10px] font-extrabold mr-1 hover:underline">
                Open Full
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="p-2 divide-y divide-slate-100 dark:divide-border/40 max-h-72 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs font-extrabold text-muted-foreground">No recent messages</p>
                <Button size="sm" onClick={() => navigate('/network/messages/new')} className="rounded-xl text-xs font-bold h-7 px-3 bg-blue-600">
                  New Chat
                </Button>
              </div>
            ) : (
              conversations.map((conv: any) => {
                const partnerId = conv.participants?.find((id: string) => id !== user.id);
                const profile = profilesMap[partnerId || ''];
                const displayName = conv.is_group 
                  ? (conv.name || "Group Chat")
                  : (profile?.full_name || (profile?.email ? profile.email.split('@')[0] : null) || "Professional Member");

                return (
                  <div
                    key={conv.id}
                    onClick={() => navigate('/network/messages')}
                    className="p-2.5 flex items-center gap-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-8 h-8 border border-slate-200">
                        <AvatarImage src={profile?.profile_picture_url || undefined} alt={displayName} />
                        <AvatarFallback className="font-extrabold text-xs bg-slate-900 text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-card"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">{displayName}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold truncate">
                        {conv.last_message || profile?.title || "Executive Member"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 bg-slate-50 dark:bg-muted/40 border-t border-slate-200/80 dark:border-border/60 text-center">
            <Button
              size="sm"
              onClick={() => navigate('/network/messages')}
              className="w-full rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white h-8 shadow-sm"
            >
              Open Full Messenger Workspace
            </Button>
          </div>

        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xl transition-all hover:scale-105 border border-blue-400/40"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Messages</span>
          {conversations.length > 0 && (
            <Badge variant="secondary" className="rounded-full bg-white text-blue-700 text-[10px] font-extrabold h-4 px-1.5 min-w-4">
              {conversations.length}
            </Badge>
          )}
        </button>
      )}
    </div>
  );
};