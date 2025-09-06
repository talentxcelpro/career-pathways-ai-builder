import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageCircle, 
  UserPlus, 
  Sparkles, 
  Target,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Loader2,
  Zap,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CareerIntentBadge } from '@/components/posts/CareerIntentTags';
import { toast } from 'sonner';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

interface SmartMatch {
  id: string;
  full_name: string;
  title: string;
  profile_picture_url?: string;
  career_goals: string[];
  career_interests: string[];
  career_stage: string;
  skills?: string[];
  industry?: string;
  current_company?: string;
  matchScore: number;
  matchReasons: string[];
}

export const SmartConnectAI: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mentors' | 'peers' | 'mentees'>('all');
  const [sendingConnection, setSendingConnection] = useState<string | null>(null);
  const { triggerConnectionEmail } = useEmailAutomation();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-smart-connect'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { ...user, profile };
    }
  });

  const { data: smartMatches, isLoading } = useQuery({
    queryKey: ['smart-matches', currentUser?.id, selectedFilter],
    queryFn: async () => {
      if (!currentUser?.profile) return [];

      // Get all profiles except current user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, career_goals, career_interests, career_stage')
        .neq('id', currentUser.id)
        .not('full_name', 'is', null)
        .limit(20);

      if (error) throw error;

      const currentProfile = currentUser.profile;
      const userGoals = currentProfile.career_goals || [];
      const userInterests = currentProfile.career_interests || [];
      const userStage = currentProfile.career_stage || 'early_career';

      // Calculate match scores and filter
      const matches: SmartMatch[] = profiles
        .map(profile => {
          const matchReasons: string[] = [];
          let matchScore = 0;

          // Career goals overlap
          const goalOverlap = (profile.career_goals || []).filter(goal => 
            userGoals.includes(goal)
          );
          if (goalOverlap.length > 0) {
            matchScore += goalOverlap.length * 20;
            matchReasons.push(`Shared career goals: ${goalOverlap.join(', ')}`);
          }

          // Career interests overlap
          const interestOverlap = (profile.career_interests || []).filter(interest => 
            userInterests.includes(interest)
          );
          if (interestOverlap.length > 0) {
            matchScore += interestOverlap.length * 15;
            matchReasons.push(`Common interests: ${interestOverlap.join(', ')}`);
          }

          // Career stage matching
          const profileStage = profile.career_stage || 'early_career';
          if (selectedFilter === 'mentors' && isMoreSenior(profileStage, userStage)) {
            matchScore += 30;
            matchReasons.push('Potential mentor');
          } else if (selectedFilter === 'mentees' && isMoreSenior(userStage, profileStage)) {
            matchScore += 30;
            matchReasons.push('Potential mentee');
          } else if (selectedFilter === 'peers' && profileStage === userStage) {
            matchScore += 25;
            matchReasons.push('Same career stage');
          }

          // Similar title bonus
          if (profile.title && currentProfile.title) {
            const titleSimilarity = calculateTitleSimilarity(profile.title, currentProfile.title);
            if (titleSimilarity > 0.5) {
              matchScore += 10;
              matchReasons.push('Similar role');
            }
          }

          return {
            ...profile,
            matchScore,
            matchReasons
          };
        })
        .filter(match => {
          if (selectedFilter === 'all') return match.matchScore > 0;
          return match.matchScore > 20; // Higher threshold for filtered views
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      return matches;
    },
    enabled: !!currentUser?.profile
  });

  const isMoreSenior = (stage1: string, stage2: string): boolean => {
    const stages = ['early_career', 'mid_career', 'senior_career', 'executive'];
    return stages.indexOf(stage1) > stages.indexOf(stage2);
  };

  const calculateTitleSimilarity = (title1: string, title2: string): number => {
    const words1 = title1.toLowerCase().split(' ');
    const words2 = title2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const sendConnectionRequest = async (userId: string) => {
    if (!currentUser) return;

    setSendingConnection(userId);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser.id,
          recipient_id: userId,
          status: 'pending',
          message: 'Hi! I found your profile through Smart Connect and would love to connect with you.'
        });

      if (error) throw error;
      toast.success('Connection request sent!');
      
      // Trigger connection request email
      try {
        const recipientProfile = smartMatches?.find(match => match.id === userId);
        if (recipientProfile) {
          // Get recipient's email from profiles table
          const { data: recipient } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();
          
          if (recipient?.email) {
            await triggerConnectionEmail(
              recipient.email,
              recipientProfile.full_name,
              currentUser.profile?.full_name || currentUser.email?.split('@')[0] || 'Someone'
            );
          }
        }
      } catch (emailError) {
        console.error('Failed to send connection request email:', emailError);
        // Don't show error to user as connection request was successful
      }
    } catch (error) {
      toast.error('Failed to send connection request');
    } finally {
      setSendingConnection(null);
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'early_career':
        return <GraduationCap className="h-4 w-4" />;
      case 'mid_career':
        return <Briefcase className="h-4 w-4" />;
      case 'senior_career':
      case 'executive':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'early_career':
        return 'Early Career';
      case 'mid_career':
        return 'Mid Career';
      case 'senior_career':
        return 'Senior Level';
      case 'executive':
        return 'Executive';
      default:
        return 'Professional';
    }
  };

  if (!currentUser?.profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h3>
          <p className="text-gray-600 mb-4">
            Add career goals and interests to get personalized connections
          </p>
          <Link to="/profile/edit">
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">AI Connect</h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <Star className="h-3 w-3 mr-1" />
                  Powered by AI
                </Badge>
              </div>
              <p className="text-gray-700 text-sm">
                Use AI to discover new connections, mentors, and collaborators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'All Matches', icon: Users },
              { key: 'mentors', label: 'Mentors', icon: TrendingUp },
              { key: 'peers', label: 'Peers', icon: Users },
              { key: 'mentees', label: 'Mentees', icon: GraduationCap }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedFilter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(key as any)}
                className="flex items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Smart Matches */}
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-4 border rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : smartMatches && smartMatches.length > 0 ? (
              smartMatches.map((match) => (
                <div key={match.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <Link to={`/user/${match.id}`}>
                        <Avatar className="w-12 h-12 cursor-pointer hover:scale-105 transition-transform">
                          <AvatarImage src={match.profile_picture_url} />
                          <AvatarFallback>
                            {match.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link 
                          to={`/user/${match.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          <h4 className="font-semibold">{match.full_name}</h4>
                        </Link>
                        <p className="text-sm text-muted-foreground">{match.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {getStageIcon(match.career_stage)}
                          <span className="text-xs text-muted-foreground">
                            {getStageLabel(match.career_stage)}
                          </span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {match.matchScore}% match
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendConnectionRequest(match.id)}
                        disabled={sendingConnection === match.id}
                      >
                        {sendingConnection === match.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                      <Link to={`/network/messages/new?userId=${match.id}`}>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {match.matchReasons.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Why we matched you:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.matchReasons.map((reason, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Career Interests */}
                  {match.career_interests && match.career_interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {match.career_interests.slice(0, 3).map((interest) => (
                        <CareerIntentBadge key={interest} intentId={interest} size="sm" />
                      ))}
                      {match.career_interests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.career_interests.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No matches found for your current filter.</p>
                <p className="text-xs mt-1">Try selecting a different category or updating your profile.</p>
              </div>
            )}
          </div>

          {smartMatches && smartMatches.length > 0 && (
            <div className="mt-6 pt-4 border-t text-center">
              <Link to="/network/people">
                <Button variant="ghost" size="sm">
                  View All People
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentor Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mentor Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            AI recommends industry mentors based on your profile & goals
          </p>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">AI-powered mentor recommendations coming soon</p>
            <p className="text-xs mt-1">We're analyzing industry expertise and career paths</p>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Collaboration Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Discover projects, startups, and content creation opportunities
          </p>
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Collaboration matching coming soon</p>
            <p className="text-xs mt-1">Connect with entrepreneurs, content creators, and project teams</p>
          </div>
        </CardContent>
      </Card>

      {/* People Like You */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            People Like You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Similar interests, roles, and companies
          </p>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">AI similarity matching coming soon</p>
            <p className="text-xs mt-1">Find professionals with similar career trajectories</p>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Alumni Connect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect with people from your school/university
          </p>
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Alumni network coming soon</p>
            <p className="text-xs mt-1">Reconnect with classmates and fellow alumni</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};