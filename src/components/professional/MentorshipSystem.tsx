import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Star, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Award,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MentorshipRequest {
  id: string;
  mentee_id: string;
  mentor_id: string;
  request_message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  expertise_areas: string[];
  duration_weeks: number;
  meeting_frequency: string;
  created_at: string;
  mentee?: any;
  mentor?: any;
}

interface SkillEndorsement {
  id: string;
  user_id: string;
  endorser_id: string;
  skill_name: string;
  endorsement_strength: number;
  context_note?: string;
  created_at: string;
  endorser?: any;
}

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  date_achieved: string;
  verification_status: 'unverified' | 'verified' | 'pending';
  visibility: 'public' | 'network' | 'private';
}

const MentorshipRequestCard: React.FC<{ 
  request: MentorshipRequest; 
  isIncoming: boolean;
  onAction: (action: 'accept' | 'decline', requestId: string) => void;
}> = ({ request, isIncoming, onAction }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const targetUser = isIncoming ? request.mentee : request.mentor;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={targetUser?.profile_picture_url} />
              <AvatarFallback>
                {targetUser?.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{targetUser?.full_name || 'User'}</h4>
              <p className="text-sm text-muted-foreground">
                {targetUser?.title || 'Professional'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <Badge className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <h5 className="font-medium text-sm mb-1">Message</h5>
            <p className="text-sm text-muted-foreground">
              {request.request_message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm mb-1">Duration</h5>
              <p className="text-sm text-muted-foreground">
                {request.duration_weeks} weeks
              </p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-1">Frequency</h5>
              <p className="text-sm text-muted-foreground capitalize">
                {request.meeting_frequency}
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-sm mb-2">Expertise Areas</h5>
            <div className="flex flex-wrap gap-1">
              {request.expertise_areas.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {request.status === 'pending' && isIncoming && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onAction('accept', request.id)}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction('decline', request.id)}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {request.status === 'accepted' && (
          <Button size="sm" className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message {isIncoming ? 'Mentee' : 'Mentor'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const SkillEndorsementCard: React.FC<{ endorsement: SkillEndorsement }> = ({ 
  endorsement 
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{endorsement.skill_name}</h4>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < endorsement.endorsement_strength
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={endorsement.endorser?.profile_picture_url} />
            <AvatarFallback className="text-xs">
              {endorsement.endorser?.full_name?.charAt(0).toUpperCase() || 'E'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Endorsed by {endorsement.endorser?.full_name || 'Someone'}
          </span>
        </div>

        {endorsement.context_note && (
          <p className="text-xs text-muted-foreground italic">
            "{endorsement.context_note}"
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'certification': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'project': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'milestone': return <TrendingUp className="w-5 h-5 text-green-500" />;
      default: return <Award className="w-5 h-5 text-purple-500" />;
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">
            {getAchievementIcon(achievement.achievement_type)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{achievement.title}</h4>
              <Badge className={getVerificationColor(achievement.verification_status)}>
                {achievement.verification_status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(achievement.date_achieved).toLocaleDateString()}
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {achievement.visibility}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MentorshipSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [newRequestForm, setNewRequestForm] = useState({
    mentor_id: '',
    message: '',
    expertise_areas: [],
    duration_weeks: 12,
    meeting_frequency: 'weekly'
  });
  const queryClient = useQueryClient();

  // Fetch mentorship requests
  const { data: requests = [] } = useQuery({
    queryKey: ['mentorship-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          *,
          mentee:profiles!mentorship_requests_mentee_id_fkey(full_name, profile_picture_url, title),
          mentor:profiles!mentorship_requests_mentor_id_fkey(full_name, profile_picture_url, title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch skill endorsements
  const { data: endorsements = [] } = useQuery({
    queryKey: ['skill-endorsements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skill_endorsements')
        .select(`
          *,
          endorser:profiles!skill_endorsements_endorser_id_fkey(full_name, profile_picture_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['professional-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_achievements')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Handle mentorship request actions
  const requestActionMutation = useMutation({
    mutationFn: async ({ action, requestId }: { action: 'accept' | 'decline'; requestId: string }) => {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] });
    }
  });

  const handleRequestAction = (action: 'accept' | 'decline', requestId: string) => {
    requestActionMutation.mutate({ action, requestId });
  };

  const incomingRequests = requests.filter((req: MentorshipRequest) => 
    req.mentor_id === 'current-user-id' && req.status === 'pending'
  );

  const outgoingRequests = requests.filter((req: MentorshipRequest) => 
    req.mentee_id === 'current-user-id'
  );

  const activeConnections = requests.filter((req: MentorshipRequest) => 
    req.status === 'accepted' && 
    (req.mentor_id === 'current-user-id' || req.mentee_id === 'current-user-id')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Professional Development</h2>
        <p className="text-muted-foreground">
          Connect with mentors, showcase skills, and track your professional achievements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Mentorships</p>
                <p className="text-2xl font-bold">{activeConnections.length}</p>
              </div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skill Endorsements</p>
                <p className="text-2xl font-bold">{endorsements.length}</p>
              </div>
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
              </div>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{incomingRequests.length}</p>
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">
            Mentorship ({incomingRequests.length + outgoingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="endorsements">
            Endorsements ({endorsements.length})
          </TabsTrigger>
          <TabsTrigger value="achievements">
            Achievements ({achievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Incoming Requests */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                Mentorship Requests ({incomingRequests.length})
              </h3>
              <div className="space-y-4">
                {incomingRequests.map((request: MentorshipRequest) => (
                  <MentorshipRequestCard
                    key={request.id}
                    request={request}
                    isIncoming={true}
                    onAction={handleRequestAction}
                  />
                ))}
                {incomingRequests.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending requests</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Active Connections */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                Active Mentorships ({activeConnections.length})
              </h3>
              <div className="space-y-4">
                {activeConnections.map((request: MentorshipRequest) => (
                  <MentorshipRequestCard
                    key={request.id}
                    request={request}
                    isIncoming={request.mentor_id === 'current-user-id'}
                    onAction={handleRequestAction}
                  />
                ))}
                {activeConnections.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active mentorships</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="endorsements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {endorsements.map((endorsement: SkillEndorsement) => (
              <SkillEndorsementCard key={endorsement.id} endorsement={endorsement} />
            ))}
          </div>
          
          {endorsements.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No endorsements yet</h3>
                <p className="text-muted-foreground">
                  Connect with colleagues to receive skill endorsements
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement: Achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
          
          {achievements.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">
                  Add your professional achievements to showcase your experience
                </p>
                <Button className="mt-4">Add Achievement</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};