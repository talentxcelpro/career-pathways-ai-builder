import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Check, X, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MessageRequestItem {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderTitle: string;
  senderAvatar?: string;
  lastMessageSnippet: string;
  lastMessageTime: string;
}

const MessageRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MessageRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch conversations where user is a participant
      const { data: convos, error: convosError } = await supabase
        .from('conversations')
        .select('id, participants, last_message_id, last_updated, created_by')
        .contains('participants', [user.id])
        .eq('is_group', false)
        .order('last_updated', { ascending: false });

      if (convosError) throw convosError;
      if (!convos || convos.length === 0) {
        setRequests([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch all accepted connections for current user
      const { data: userConnections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      const connectedUserIds = new Set<string>();
      (userConnections || []).forEach(c => {
        if (c.requester_id === user.id) connectedUserIds.add(c.recipient_id);
        if (c.recipient_id === user.id) connectedUserIds.add(c.requester_id);
      });

      // 3. Find conversations where the other participant is NOT in connectedUserIds
      const requestItems: MessageRequestItem[] = [];

      for (const conv of convos) {
        const otherId = conv.participants.find(p => p !== user.id);
        if (!otherId) continue;

        // If otherId is NOT an accepted connection, it's considered a message request
        if (!connectedUserIds.has(otherId)) {
          // Fetch last message to confirm sender is the other person
          let lastMsg = 'Sent you a direct message';
          let msgTime = conv.last_updated || new Date().toISOString();

          if (conv.last_message_id) {
            const { data: msgData } = await supabase
              .from('messages')
              .select('content, sender_id, created_at')
              .eq('id', conv.last_message_id)
              .maybeSingle();

            if (msgData) {
              lastMsg = msgData.content;
              msgTime = msgData.created_at;
            }
          }

          // Fetch other user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, name, display_name, title, profile_picture_url')
            .eq('id', otherId)
            .maybeSingle();

          const name = profile?.full_name || profile?.name || profile?.display_name || 'TalentXcel Member';
          const title = profile?.title || 'Professional Member';

          requestItems.push({
            conversationId: conv.id,
            senderId: otherId,
            senderName: name,
            senderTitle: title,
            senderAvatar: profile?.profile_picture_url,
            lastMessageSnippet: lastMsg,
            lastMessageTime: msgTime,
          });
        }
      }

      setRequests(requestItems);
    } catch (err) {
      console.error('Error fetching message requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const handleAccept = async (req: MessageRequestItem) => {
    if (!user?.id) return;
    setActionLoading(req.conversationId);
    try {
      // Connect with user
      await supabase
        .from('connections')
        .upsert({
          requester_id: user.id,
          recipient_id: req.senderId,
          status: 'accepted',
          updated_at: new Date().toISOString()
        });

      toast.success(`Accepted message request from ${req.senderName}`);
      navigate(`/network/messages/${req.conversationId}`);
    } catch (err: any) {
      console.error('Error accepting message request:', err);
      toast.error('Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (req: MessageRequestItem) => {
    if (!user?.id) return;
    setActionLoading(req.conversationId);
    try {
      // Remove conversation from state
      setRequests(prev => prev.filter(r => r.conversationId !== req.conversationId));
      toast.info(`Declined message request from ${req.senderName}`);
    } catch (err) {
      console.error('Error declining request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">Message Requests</h1>
            <p className="text-gray-600 dark:text-muted-foreground mt-1">Review direct messages from people outside your 1st-degree connections</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">
                No pending requests
              </h3>
              <p className="text-gray-600 dark:text-muted-foreground">
                You're all caught up! Messages from new connections will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.conversationId} className="overflow-hidden border border-slate-200 dark:border-border">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border shadow-sm">
                      <AvatarImage src={req.senderAvatar} />
                      <AvatarFallback className="font-bold bg-blue-600 text-white">
                        {req.senderName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-foreground">{req.senderName}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{req.senderTitle}</p>
                      <p className="text-sm text-foreground/80 font-normal line-clamp-1 italic bg-slate-50 dark:bg-muted/50 p-2 rounded-lg border border-slate-100 dark:border-border mt-1">
                        "{req.lastMessageSnippet}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDecline(req)}
                      disabled={actionLoading === req.conversationId}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleAccept(req)}
                      disabled={actionLoading === req.conversationId}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {actionLoading === req.conversationId ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Accept & Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageRequests;
