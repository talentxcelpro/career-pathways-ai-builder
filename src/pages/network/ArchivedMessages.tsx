import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Archive, MessageCircle, ArchiveRestore, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ArchivedConversation {
  id: string;
  otherUserId: string;
  name: string;
  title: string;
  avatarUrl?: string;
  lastMessageSnippet: string;
  lastUpdated: string;
}

const ArchivedMessages: React.FC = () => {
  const { user } = useAuth();
  const [archivedList, setArchivedList] = useState<ArchivedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

  const fetchArchived = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Query conversations where user is participant and user ID is in archived_by
      const { data: convos, error } = await supabase
        .from('conversations')
        .select('id, participants, last_message_id, last_updated, archived_by')
        .contains('participants', [user.id])
        .contains('archived_by', [user.id])
        .order('last_updated', { ascending: false });

      if (error) {
        console.warn('Could not query archived conversations:', error);
        setArchivedList([]);
        return;
      }

      if (!convos || convos.length === 0) {
        setArchivedList([]);
        return;
      }

      const results: ArchivedConversation[] = [];

      for (const conv of convos) {
        const otherId = conv.participants.find(p => p !== user.id) || user.id;

        // Fetch last message
        let lastMsg = 'No messages';
        if (conv.last_message_id) {
          const { data: msg } = await supabase
            .from('messages')
            .select('content')
            .eq('id', conv.last_message_id)
            .maybeSingle();
          if (msg?.content) lastMsg = msg.content;
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, name, display_name, title, profile_picture_url')
          .eq('id', otherId)
          .maybeSingle();

        const name = profile?.full_name || profile?.name || profile?.display_name || 'Member';
        const title = profile?.title || 'Professional Member';

        results.push({
          id: conv.id,
          otherUserId: otherId,
          name,
          title,
          avatarUrl: profile?.profile_picture_url,
          lastMessageSnippet: lastMsg,
          lastUpdated: conv.last_updated || new Date().toISOString(),
        });
      }

      setArchivedList(results);
    } catch (err) {
      console.error('Error in fetchArchived:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, [user?.id]);

  const handleUnarchive = async (convoId: string) => {
    if (!user?.id) return;
    setUnarchivingId(convoId);

    try {
      // Remove user.id from archived_by array
      const { data: existing } = await supabase
        .from('conversations')
        .select('archived_by')
        .eq('id', convoId)
        .single();

      const currentArchived = (existing?.archived_by as string[]) || [];
      const updated = currentArchived.filter(id => id !== user.id);

      const { error } = await supabase
        .from('conversations')
        .update({ archived_by: updated } as any)
        .eq('id', convoId);

      if (error) throw error;

      toast.success("Conversation unarchived and restored to active messages");
      setArchivedList(prev => prev.filter(c => c.id !== convoId));
    } catch (err: any) {
      console.error('Failed to unarchive:', err);
      toast.error('Could not unarchive conversation');
    } finally {
      setUnarchivingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 dark:bg-background font-system">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground tracking-tight">Archived Messages</h1>
            <p className="text-slate-600 dark:text-muted-foreground mt-1 font-medium">View and restore your archived conversations</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : archivedList.length === 0 ? (
          <Card className="bg-white/95 dark:bg-card backdrop-blur-sm border-slate-200/60 dark:border-border rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900 dark:text-foreground font-semibold tracking-tight">
                <Archive className="h-5 w-5 mr-2 text-muted-foreground" />
                Archived Conversations
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2 tracking-tight">No archived messages</h3>
              <p className="text-slate-600 dark:text-muted-foreground font-medium">Conversations you archive will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {archivedList.map((item) => (
              <Card key={item.id} className="border border-slate-200 dark:border-border overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <Link to={`/network/messages/${item.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-11 w-11 border">
                      <AvatarImage src={item.avatarUrl} />
                      <AvatarFallback className="font-bold bg-slate-800 text-white">
                        {item.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                      <p className="text-xs text-foreground/70 truncate mt-0.5 italic">
                        {item.lastMessageSnippet}
                      </p>
                    </div>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnarchive(item.id)}
                    disabled={unarchivingId === item.id}
                    className="shrink-0 gap-1.5"
                  >
                    {unarchivingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArchiveRestore className="h-4 w-4 text-blue-600" />
                    )}
                    <span>Unarchive</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedMessages;
