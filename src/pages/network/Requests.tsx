import React, { useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, UserPlus, ArrowLeft, Trash2, ExternalLink, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionRequestItem {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  message?: string | null;
  created_at: string;
  connected_at?: string | null;
}

interface ProfileSummary {
  id: string;
  full_name: string;
  title?: string | null;
  headline?: string | null;
  profile_picture_url?: string | null;
  location?: string | null;
  username?: string | null;
}

const Requests: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Connection Requests | Professional Network | TalentXcel";
  }, []);

  // 1. Fetch live connection requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['connection-requests', user?.id],
    queryFn: async (): Promise<ConnectionRequestItem[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ConnectionRequestItem[];
    },
    enabled: !!user?.id
  });

  // 2. Fetch profiles for all participants
  const partnerUserIds = useMemo(() => {
    if (!user?.id) return [];
    const ids = requests.map(r => r.requester_id === user.id ? r.recipient_id : r.requester_id);
    return Array.from(new Set(ids.filter(Boolean)));
  }, [requests, user?.id]);

  const { data: profilesMap = new Map<string, ProfileSummary>() } = useQuery({
    queryKey: ['connection-requests-profiles', partnerUserIds],
    queryFn: async () => {
      if (partnerUserIds.length === 0) return new Map<string, ProfileSummary>();

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, headline, profile_picture_url, profile_photo_url, location, username')
        .in('id', partnerUserIds);

      if (error) throw error;
      const map = new Map<string, ProfileSummary>();
      (data || []).forEach((p: any) => {
        map.set(p.id, {
          id: p.id,
          full_name: p.full_name || 'Professional Member',
          title: p.title || p.headline || 'Member',
          headline: p.headline,
          profile_picture_url: p.profile_picture_url || p.profile_photo_url || null,
          location: p.location,
          username: p.username
        });
      });
      return map;
    },
    enabled: partnerUserIds.length > 0
  });

  // 3. Update Request Mutation (Accept / Decline)
  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'declined' }) => {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status,
          connected_at: status === 'accepted' ? new Date().toISOString() : null
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequestsCount'] });
      toast.success(variables.status === 'accepted' ? 'Connection accepted!' : 'Connection declined');
    },
    onError: (error: any) => {
      toast.error('Failed to update request');
      console.error('Request update error:', error);
    }
  });

  // 4. Withdraw Sent Request Mutation
  const withdrawRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequestsCount'] });
      toast.success('Invitation withdrawn successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to withdraw request');
      console.error('Withdraw error:', error);
    }
  });

  const receivedRequests = useMemo(() => {
    if (!user?.id) return [];
    return requests.filter(r => r.recipient_id === user.id && r.status === 'pending');
  }, [requests, user?.id]);

  const sentRequests = useMemo(() => {
    if (!user?.id) return [];
    return requests.filter(r => r.requester_id === user.id);
  }, [requests, user?.id]);

  const renderRequestCard = (request: ConnectionRequestItem, isReceived: boolean) => {
    const partnerId = isReceived ? request.requester_id : request.recipient_id;
    const profile = profilesMap.get(partnerId);

    const displayName = profile?.full_name || 'Professional Member';
    const displayTitle = profile?.title || 'Professional Network';
    const displayLocation = profile?.location || null;
    const avatarUrl = profile?.profile_picture_url || undefined;
    const profileUrl = profile?.username ? `/profile/${profile.username}` : `/p/${partnerId}`;

    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'U';

    return (
      <Card key={request.id} className="hover:shadow-sm border-slate-200/80 dark:border-border/60 transition-all rounded-2xl overflow-hidden bg-white dark:bg-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            
            {/* User Profile Info */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <Link to={profileUrl} className="shrink-0 group">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full border border-slate-200 dark:border-border group-hover:ring-2 group-hover:ring-blue-500 transition-all overflow-hidden bg-slate-100 dark:bg-muted">
                  <AvatarImage src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link to={profileUrl} className="font-bold text-sm sm:text-base text-foreground hover:text-blue-600 hover:underline transition-colors truncate">
                    {displayName}
                  </Link>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60 shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{displayTitle}</p>
                {displayLocation && (
                  <p className="text-[11px] text-muted-foreground truncate">{displayLocation}</p>
                )}
              </div>
            </div>
            
            {/* Status & Actions */}
            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-border/60 justify-between sm:justify-start">
              <Badge 
                variant={
                  request.status === 'accepted' ? 'default' : 
                  request.status === 'pending' ? 'secondary' : 
                  'destructive'
                }
                className={`text-xs capitalize font-bold px-2.5 py-0.5 ${
                  request.status === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                }`}
              >
                {request.status}
              </Badge>
              
              {isReceived && request.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateRequestMutation.mutate({ requestId: request.id, status: 'accepted' })}
                    disabled={updateRequestMutation.isPending}
                    className="h-8.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateRequestMutation.mutate({ requestId: request.id, status: 'declined' })}
                    disabled={updateRequestMutation.isPending}
                    className="h-8.5 px-3 rounded-xl text-xs font-semibold cursor-pointer border-slate-200 dark:border-border"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Decline
                  </Button>
                </div>
              )}

              {!isReceived && request.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => withdrawRequestMutation.mutate(request.id)}
                  disabled={withdrawRequestMutation.isPending}
                  className="h-8.5 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Withdraw
                </Button>
              )}
            </div>
          </div>
          
          {request.message && (
            <div className="mt-3.5 p-3 bg-slate-50 dark:bg-muted/40 rounded-xl border border-slate-100 dark:border-border/60">
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic">"{request.message}"</p>
            </div>
          )}
          
          <div className="mt-3 text-[11px] text-muted-foreground font-medium flex items-center justify-between">
            <span>{isReceived ? 'Received' : 'Sent'} on {new Date(request.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background pb-20">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/network')} 
            className="rounded-xl h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Network
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/network/connections')}
            className="rounded-xl h-8 px-3 text-xs font-semibold border-slate-200 dark:border-border cursor-pointer flex items-center gap-1.5"
          >
            <Users className="h-3.5 w-3.5 text-purple-600" />
            My Connections
          </Button>
        </div>

        {/* Header Title Card */}
        <div className="mb-5 sm:mb-6 p-4 sm:p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Connection Requests</h1>
                <Badge variant="outline" className="text-[10px] font-bold border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800">
                  Network
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Manage incoming networking invitations and monitor pending outreach.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1 rounded-lg">
                {receivedRequests.length} Incoming
              </Badge>
              <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1 rounded-lg">
                {sentRequests.length} Sent
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="received" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-white dark:bg-card border border-slate-200 dark:border-border">
            <TabsTrigger value="received" className="flex items-center justify-center text-xs font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center justify-center text-xs font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-3 mt-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse rounded-2xl border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 dark:bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : receivedRequests.length > 0 ? (
              receivedRequests.map(request => renderRequestCard(request, true))
            ) : (
              <Card className="rounded-2xl border-slate-200 dark:border-border bg-white dark:bg-card">
                <CardContent className="p-12 text-center space-y-2">
                  <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No pending incoming requests</h3>
                  <p className="text-xs text-muted-foreground">You are all caught up! When other professionals invite you to connect, they will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3 mt-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse rounded-2xl border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 dark:bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : sentRequests.length > 0 ? (
              sentRequests.map(request => renderRequestCard(request, false))
            ) : (
              <Card className="rounded-2xl border-slate-200 dark:border-border bg-white dark:bg-card">
                <CardContent className="p-12 text-center space-y-3">
                  <UserPlus className="h-10 w-10 text-muted-foreground mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No sent requests</h3>
                  <p className="text-xs text-muted-foreground">Discover verified professionals and send connection invitations from the directory or feed.</p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/network/people')} 
                    className="mt-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    Browse Professionals Directory
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Requests;