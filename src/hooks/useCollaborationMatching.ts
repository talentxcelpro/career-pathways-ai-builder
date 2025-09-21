import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface CollaborationOpportunity {
  id: string;
  title: string;
  description: string;
  collaboration_type: string; // actual column name
  skills_needed: string[]; // actual column name  
  time_commitment?: string;
  compensation_type?: string;
  remote_ok?: boolean; // actual column name
  location?: string;
  max_collaborators?: number;
  tags?: string[];
  applications_count?: number;
  status: 'open' | 'in-progress' | 'completed' | 'paused';
  created_by: string;
  created_at: string;
  expires_at?: string;
  creator_profile?: any;
  matchScore?: number;
  matchReasons?: string[];
}

export interface CollaborationApplication {
  id: string;
  opportunity_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  application_message: string;
  relevant_experience?: string;
  portfolio_links?: string[];
  availability_start?: string;
  created_at: string;
  opportunity?: CollaborationOpportunity;
  applicant_profile?: any;
}

export const useCollaborationMatching = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // Get current user profile
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Get collaboration opportunities
  const { data: opportunities = [], isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ['collaboration-opportunities', user?.id],
    queryFn: async () => {
      if (!user?.id || !currentUserProfile) return [];

      const { data, error } = await supabase
        .from('collaboration_opportunities')
        .select(`
          *,
          creator_profile:profiles!collaboration_opportunities_created_by_fkey(*)
        `)
        .neq('created_by', user.id) // Don't show user's own projects
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate match scores for each opportunity
      const scoredOpportunities = data.map(opportunity => {
        const matchData = calculateCollaborationMatch(currentUserProfile, opportunity);
        return {
          ...opportunity,
          ...matchData
        };
      });

      // Sort by match score and return top matches (more lenient threshold)
      return scoredOpportunities
        .filter(opp => (opp.matchScore || 0) > 10) // Lower threshold
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 20);
    },
    enabled: !!user?.id && !!currentUserProfile,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get user's own collaboration opportunities
  const { data: myOpportunities = [], isLoading: isLoadingMyOpportunities } = useQuery({
    queryKey: ['my-collaboration-opportunities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('collaboration_opportunities')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });

  // Get collaboration applications
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ['collaboration-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('collaboration_applications')
        .select(`
          *,
          opportunity:collaboration_opportunities(*),
          applicant_profile:profiles!collaboration_applications_user_id_fkey(*)
        `)
        .or(`user_id.eq.${user.id},opportunity.created_by.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CollaborationApplication[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });

  // Calculate collaboration match score
  const calculateCollaborationMatch = (userProfile: any, opportunity: CollaborationOpportunity) => {
    let score = 0;
    const reasons: string[] = [];

    // Skills match (high importance) - using actual column name
    if (userProfile.skills && opportunity.skills_needed) {
      const skillMatches = userProfile.skills.filter((skill: string) =>
        opportunity.skills_needed.some(reqSkill => 
          skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      if (skillMatches.length > 0) {
        const skillScore = (skillMatches.length / opportunity.skills_needed.length) * 50;
        score += skillScore;
        reasons.push(`${skillMatches.length}/${opportunity.skills_needed.length} skills match`);
      }
    }

    // Industry/interest alignment
    if (userProfile.career_interests && userProfile.industry) {
      const interests = userProfile.career_interests.join(' ').toLowerCase();
      const projectDescription = (opportunity.title + ' ' + opportunity.description).toLowerCase();
      
      const relevantInterests = userProfile.career_interests.filter((interest: string) =>
        projectDescription.includes(interest.toLowerCase())
      );
      
      if (relevantInterests.length > 0) {
        score += relevantInterests.length * 10;
        reasons.push('Relevant interests');
      }
    }

    // Location compatibility - using actual column  
    if (opportunity.remote_ok) {
      score += 15;
      reasons.push('Remote work');
    } else if (userProfile.location && opportunity.location) {
      if (userProfile.location.toLowerCase().includes(opportunity.location.toLowerCase()) ||
          opportunity.location.toLowerCase().includes(userProfile.location.toLowerCase())) {
        score += 20;
        reasons.push('Location match');
      }
    }

    // Collaboration type appeal
    if (userProfile.career_goals) {
      const goalText = userProfile.career_goals.join(' ').toLowerCase();
      const collabType = opportunity.collaboration_type.toLowerCase();
      if (goalText.includes(collabType) || collabType.includes('startup') || collabType.includes('project')) {
        score += 20;
        reasons.push('Relevant collaboration type');
      }
    }

    // Time commitment alignment (boost for flexible)
    if (opportunity.time_commitment === 'flexible' || opportunity.time_commitment === 'part-time') {
      score += 10;
      reasons.push('Flexible commitment');
    }

    // Compensation preference  
    if (opportunity.compensation_type && opportunity.compensation_type !== 'unpaid') {
      score += 10;
      reasons.push('Paid opportunity');
    }

    // Add base compatibility score for all opportunities
    score += 10;
    reasons.push('Open opportunity');

    // Boost score for opportunities with flexible requirements
    if (opportunity.skills_needed && opportunity.skills_needed.length <= 3) {
      score += 5;
      reasons.push('Accessible requirements');
    }

    return {
      matchScore: Math.min(score, 100),
      matchReasons: reasons
    };
  };

  const getCareerStageLevel = (stage: string): number => {
    const stages: { [key: string]: number } = {
      'student': 1,
      'entry-level': 2,
      'mid-level': 3,
      'senior': 4,
      'executive': 5
    };
    return stages[stage.toLowerCase()] || 2;
  };

  const getProjectComplexity = (stage: string): number => {
    const complexity: { [key: string]: number } = {
      'idea': 1,
      'mvp': 2,
      'beta': 3,
      'launched': 4,
      'growth': 5
    };
    return complexity[stage.toLowerCase()] || 2;
  };

  // Create collaboration opportunity
  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: Partial<CollaborationOpportunity>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collaboration_opportunities')
        .insert({
          ...opportunityData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-collaboration-opportunities'] });
      toast.success('Collaboration opportunity created!');
    },
    onError: (error: any) => {
      toast.error('Failed to create opportunity');
      console.error(error);
    }
  });

  // Apply to collaboration opportunity
  const applyToOpportunityMutation = useMutation({
    mutationFn: async ({
      opportunityId,
      message,
      experience,
      portfolioLinks,
      availabilityStart
    }: {
      opportunityId: string;
      message: string;
      experience?: string;
      portfolioLinks?: string[];
      availabilityStart?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collaboration_applications')
        .insert({
          opportunity_id: opportunityId,
          user_id: user.id,
          status: 'pending',
          application_message: message,
          relevant_experience: experience,
          portfolio_links: portfolioLinks,
          availability_start: availabilityStart
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-applications'] });
      toast.success('Application submitted!');
    },
    onError: (error: any) => {
      toast.error('Failed to submit application');
      console.error(error);
    }
  });

  // Respond to collaboration application
  const respondToApplicationMutation = useMutation({
    mutationFn: async ({
      applicationId,
      action,
      response
    }: {
      applicationId: string;
      action: 'accept' | 'decline';
      response?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collaboration_applications')
        .update({
          status: action === 'accept' ? 'accepted' : 'declined',
          response_message: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-applications'] });
      toast.success(`Application ${variables.action}ed`);
    },
    onError: (error: any) => {
      toast.error('Failed to respond to application');
      console.error(error);
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('collaboration-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_applications',
          filter: `user_id.eq.${user.id}`
        },
        (payload) => {
          console.log('Collaboration application update:', payload);
          queryClient.invalidateQueries({ queryKey: ['collaboration-applications'] });
          
          if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            if (newRecord.status === 'accepted') {
              toast.success('Your application was accepted!');
            } else if (newRecord.status === 'declined') {
              toast.info('Application was declined');
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_opportunities'
        },
        (payload) => {
          console.log('New collaboration opportunity:', payload);
          queryClient.invalidateQueries({ queryKey: ['collaboration-opportunities'] });
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [user?.id, queryClient]);

  return {
    opportunities,
    isLoadingOpportunities,
    myOpportunities,
    isLoadingMyOpportunities,
    applications,
    isLoadingApplications,
    createOpportunity: createOpportunityMutation.mutate,
    isCreatingOpportunity: createOpportunityMutation.isPending,
    applyToOpportunity: applyToOpportunityMutation.mutate,
    isApplyingToOpportunity: applyToOpportunityMutation.isPending,
    respondToApplication: respondToApplicationMutation.mutate,
    isRespondingToApplication: respondToApplicationMutation.isPending,
    currentUserProfile
  };
};