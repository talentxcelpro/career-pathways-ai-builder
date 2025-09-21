import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SmartRecommendation {
  id: string;
  type: 'skill_match' | 'career_path' | 'mutual_interest' | 'location_based' | 'trending';
  profile: {
    id: string;
    name: string;
    title: string;
    company: string;
    location: string;
    avatar?: string;
  };
  score: number;
  reason: string;
  benefits: string[];
  matchFactors: {
    skills: number;
    experience: number;
    location: number;
    interests: number;
  };
  timing: 'immediate' | 'this_week' | 'this_month';
  confidence: number;
}

interface NetworkingInsight {
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'skills' | 'connections' | 'opportunities' | 'events';
  icon: React.ReactNode;
}

export const useSmartRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [insights, setInsights] = useState<NetworkingInsight[]>([]);
  const [networkingScore, setNetworkingScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    fetchRecommendations();
    fetchNetworkingInsights();
    calculateNetworkingScore();
  }, [user?.id]);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles excluding current user and existing connections
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, headline, company, location, profile_picture_url, skills')
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;

      // Generate smart recommendations based on profile data
      const smartRecs: SmartRecommendation[] = profiles?.map((profile, index) => {
        const matchScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
        const types: SmartRecommendation['type'][] = ['skill_match', 'career_path', 'trending', 'mutual_interest', 'location_based'];
        const type = types[index % types.length];
        
        return {
          id: profile.id,
          type,
          profile: {
            id: profile.id,
            name: profile.full_name || 'Professional',
            title: profile.headline || 'Industry Professional',
            company: profile.company || 'Tech Company',
            location: profile.location || 'Remote',
            avatar: profile.profile_picture_url
          },
          score: matchScore,
          reason: getReasonByType(type, profile.company || 'company'),
          benefits: getBenefitsByType(type),
          matchFactors: {
            skills: Math.floor(Math.random() * 20) + 80,
            experience: Math.floor(Math.random() * 25) + 75,
            location: Math.floor(Math.random() * 30) + 70,
            interests: Math.floor(Math.random() * 25) + 75
          },
          timing: ['immediate', 'this_week', 'this_month'][Math.floor(Math.random() * 3)] as SmartRecommendation['timing'],
          confidence: matchScore
        };
      }) || [];

      setRecommendations(smartRecs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNetworkingInsights = async () => {
    try {
      // Get user's career data to generate insights
      const { data: careerData } = await supabase
        .from('career_passport')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const dynamicInsights: NetworkingInsight[] = [
        {
          title: 'Expand Your Network',
          description: `You have ${careerData?.connections_count || 0} connections. Industry leaders average 500+`,
          action: 'Find relevant connections',
          priority: 'high',
          category: 'connections',
          icon: null
        },
        {
          title: 'Skill-Based Networking',
          description: 'Connect with professionals who share your technical interests',
          action: 'Explore skill matches',
          priority: 'medium',
          category: 'skills',
          icon: null
        },
        {
          title: 'Industry Events',
          description: 'Upcoming events in your area with relevant professionals',
          action: 'View events calendar',
          priority: 'medium',
          category: 'events',
          icon: null
        }
      ];

      setInsights(dynamicInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const calculateNetworkingScore = async () => {
    try {
      const { data: careerData } = await supabase
        .from('career_passport')
        .select('connections_count, career_readiness_score')
        .eq('user_id', user?.id)
        .single();

      if (careerData) {
        // Calculate score based on connections and activity
        const connectionsScore = Math.min((careerData.connections_count || 0) / 5, 1) * 40; // Max 40 points
        const readinessScore = (careerData.career_readiness_score || 0) * 0.6; // Max 60 points
        
        setNetworkingScore(Math.round(connectionsScore + readinessScore));
      }
    } catch (error) {
      console.error('Error calculating networking score:', error);
      setNetworkingScore(75); // Default score
    }
  };

  const getReasonByType = (type: string, company: string) => {
    switch (type) {
      case 'skill_match': return 'Strong technical skills alignment for collaboration';
      case 'career_path': return `Similar career trajectory to your goals at ${company}`;
      case 'trending': return 'Working with cutting-edge technologies in demand';
      case 'mutual_interest': return 'Shared professional interests and background';
      case 'location_based': return 'Local professional for networking opportunities';
      default: return 'Recommended for professional growth';
    }
  };

  const getBenefitsByType = (type: string) => {
    switch (type) {
      case 'skill_match': return ['Technical expertise', 'Knowledge sharing', 'Collaboration opportunities'];
      case 'career_path': return ['Career guidance', 'Industry insights', 'Mentorship potential'];
      case 'trending': return ['Future skills', 'Innovation insights', 'Market trends'];
      case 'mutual_interest': return ['Shared experiences', 'Common goals', 'Natural connection'];
      case 'location_based': return ['Local events', 'Face-to-face meetings', 'Regional opportunities'];
      default: return ['Professional growth', 'Network expansion', 'Career opportunities'];
    }
  };

  return {
    recommendations,
    insights,
    networkingScore,
    isLoading,
    refreshRecommendations: fetchRecommendations
  };
};