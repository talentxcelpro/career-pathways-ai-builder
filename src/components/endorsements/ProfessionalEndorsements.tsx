import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, Plus, ThumbsUp, MessageSquare, Award, 
  Users, TrendingUp, CheckCircle, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Endorsement {
  id: string;
  skill_name: string;
  endorser_id: string;
  endorsed_user_id: string;
  relationship: string;
  endorsement_note?: string;
  strength_rating: number;
  created_at: string;
  endorser: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    headline?: string;
    current_company?: string;
  };
}

interface EndorsementRequest {
  id: string;
  skill_name: string;
  requested_from_id: string;
  requesting_user_id: string;
  message?: string;
  status: 'pending' | 'completed' | 'declined';
  created_at: string;
  requested_from: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    headline?: string;
  };
}

interface ProfessionalEndorsementsProps {
  userId?: string;
  isOwnProfile?: boolean;
}

export const ProfessionalEndorsements: React.FC<ProfessionalEndorsementsProps> = ({
  userId,
  isOwnProfile = false
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [endorseDialogOpen, setEndorseDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Form states
  const [endorsementForm, setEndorsementForm] = useState({
    skill_name: '',
    relationship: '',
    endorsement_note: '',
    strength_rating: 5
  });
  
  const [requestForm, setRequestForm] = useState({
    skill_name: '',
    message: ''
  });

  const targetUserId = userId || user?.id;

  // Fetch endorsements for user
  const { data: endorsements = [] } = useQuery({
    queryKey: ['endorsements', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('skill_endorsements')
        .select(`
          *,
          endorser:profiles!skill_endorsements_endorser_id_fkey(
            id, full_name, profile_picture_url, headline, current_company
          )
        `)
        .eq('endorsed_user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Endorsement[];
    },
    enabled: !!targetUserId
  });

  // Fetch endorsement requests for current user
  const { data: requests = [] } = useQuery({
    queryKey: ['endorsement-requests', user?.id],
    queryFn: async () => {
      if (!user?.id || !isOwnProfile) return [];

      const { data, error } = await supabase
        .from('endorsement_requests')
        .select(`
          *,
          requested_from:profiles!endorsement_requests_requested_from_id_fkey(
            id, full_name, profile_picture_url, headline
          )
        `)
        .eq('requesting_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EndorsementRequest[];
    },
    enabled: !!user?.id && isOwnProfile
  });

  // Fetch user's connections for endorsement requests
  const { data: connections = [] } = useQuery({
    queryKey: ['user-connections', user?.id],
    queryFn: async () => {
      if (!user?.id || !isOwnProfile) return [];

      const { data, error } = await supabase
        .from('connections')
        .select(`
          recipient_id, requester_id,
          recipient:profiles!connections_recipient_id_fkey(id, full_name, profile_picture_url, headline),
          requester:profiles!connections_requester_id_fkey(id, full_name, profile_picture_url, headline)
        `)
        .or(`recipient_id.eq.${user.id},requester_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      return data.map(conn => {
        const isRecipient = conn.recipient_id === user.id;
        return isRecipient ? conn.requester : conn.recipient;
      }).filter(Boolean);
    },
    enabled: !!user?.id && isOwnProfile
  });

  // Add endorsement mutation
  const addEndorsementMutation = useMutation({
    mutationFn: async (endorsementData: typeof endorsementForm & { endorsed_user_id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('skill_endorsements')
        .insert({
          ...endorsementData,
          endorser_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endorsements'] });
      setEndorseDialogOpen(false);
      setEndorsementForm({ skill_name: '', relationship: '', endorsement_note: '', strength_rating: 5 });
      toast.success('Endorsement added successfully!');
    },
    onError: () => {
      toast.error('Failed to add endorsement');
    }
  });

  // Request endorsement mutation
  const requestEndorsementMutation = useMutation({
    mutationFn: async (requestData: typeof requestForm & { requested_from_id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('endorsement_requests')
        .insert({
          ...requestData,
          requesting_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endorsement-requests'] });
      setRequestDialogOpen(false);
      setRequestForm({ skill_name: '', message: '' });
      toast.success('Endorsement request sent!');
    },
    onError: () => {
      toast.error('Failed to send endorsement request');
    }
  });

  // Group endorsements by skill
  const endorsementsBySkill = endorsements.reduce((acc, endorsement) => {
    const skill = endorsement.skill_name;
    if (!acc[skill]) {
      acc[skill] = [];
    }
    acc[skill].push(endorsement);
    return acc;
  }, {} as Record<string, Endorsement[]>);

  const handleEndorse = () => {
    if (!selectedUser || !endorsementForm.skill_name) return;
    
    addEndorsementMutation.mutate({
      ...endorsementForm,
      endorsed_user_id: selectedUser
    });
  };

  const handleRequestEndorsement = () => {
    if (!selectedUser || !requestForm.skill_name) return;
    
    requestEndorsementMutation.mutate({
      ...requestForm,
      requested_from_id: selectedUser
    });
  };

  const formatDisplayName = (profile: any) => {
    return profile?.full_name || 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const name = formatDisplayName(profile);
    if (name === 'Professional User') return 'PU';
    
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const getRelationshipBadgeColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'colleague': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'client': return 'bg-green-100 text-green-800';
      case 'mentor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Professional Endorsements</h2>
        {isOwnProfile && (
          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Endorsement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request an Endorsement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Connection</label>
                  <Select onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose someone to request from" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.map((connection: any) => (
                        <SelectItem key={connection.id} value={connection.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={connection.profile_picture_url} />
                              <AvatarFallback className="text-xs">
                                {generateInitials(connection)}
                              </AvatarFallback>
                            </Avatar>
                            {formatDisplayName(connection)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Skill</label>
                  <Input
                    placeholder="Which skill would you like endorsed?"
                    value={requestForm.skill_name}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, skill_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message (Optional)</label>
                  <Textarea
                    placeholder="Add a personal message..."
                    value={requestForm.message}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleRequestEndorsement}
                  disabled={!selectedUser || !requestForm.skill_name || requestEndorsementMutation.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList>
          <TabsTrigger value="received">
            Received ({endorsements.length})
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="requests">
              Requests ({requests.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="received" className="space-y-6">
          {Object.keys(endorsementsBySkill).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Endorsements Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your professional reputation by connecting with colleagues and asking for endorsements.
                </p>
                {isOwnProfile && (
                  <Button onClick={() => setRequestDialogOpen(true)}>
                    Request Your First Endorsement
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {Object.entries(endorsementsBySkill).map(([skill, skillEndorsements]) => (
                <Card key={skill}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {skill}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {skillEndorsements.length} endorsement{skillEndorsements.length !== 1 ? 's' : ''}
                        </Badge>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(skillEndorsements.reduce((sum, e) => sum + e.strength_rating, 0) / skillEndorsements.length)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillEndorsements.map((endorsement) => (
                        <div key={endorsement.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                          <Link to={`/network/people/${endorsement.endorser.id}`}>
                            <Avatar className="h-12 w-12 hover:scale-105 transition-transform">
                              <AvatarImage src={endorsement.endorser.profile_picture_url} />
                              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                                {generateInitials(endorsement.endorser)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Link 
                                  to={`/network/people/${endorsement.endorser.id}`}
                                  className="font-semibold hover:text-primary transition-colors"
                                >
                                  {formatDisplayName(endorsement.endorser)}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  {endorsement.endorser.headline || endorsement.endorser.current_company}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getRelationshipBadgeColor(endorsement.relationship)}>
                                  {endorsement.relationship}
                                </Badge>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < endorsement.strength_rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {endorsement.endorsement_note && (
                              <p className="text-sm text-muted-foreground italic">
                                "{endorsement.endorsement_note}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(endorsement.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="requests" className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    Your endorsement requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.requested_from.profile_picture_url} />
                        <AvatarFallback>
                          {generateInitials(request.requested_from)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              Endorsement request for "{request.skill_name}"
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Requested from {formatDisplayName(request.requested_from)}
                            </p>
                          </div>
                          <Badge 
                            variant={request.status === 'pending' ? 'secondary' : 
                                   request.status === 'completed' ? 'default' : 'destructive'}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};