import { useState, useEffect } from 'react';

interface IntelligentMatch {
  id: string;
  name: string;
  title: string;
  company: string;
  matchScore: number;
  mutualConnections: number;
  isOnline: boolean;
  matchReasons: string[];
}

interface NetworkInsight {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface Recommendation {
  title: string;
  description: string;
  action: string;
}

interface NetworkingConfig {
  type: 'coffee' | 'introduction' | 'group';
}

export const useNetworkingIntelligence = () => {
  const [intelligentMatches, setIntelligentMatches] = useState<IntelligentMatch[]>([]);
  const [networkInsights, setNetworkInsights] = useState<NetworkInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock intelligent networking data
    setIntelligentMatches([
      {
        id: '1',
        name: 'Sarah Chen',
        title: 'Senior Product Manager',
        company: 'TechCorp',
        matchScore: 94,
        mutualConnections: 8,
        isOnline: true,
        matchReasons: [
          'Similar career trajectory',
          'Shared interest in AI/ML',
          'Works in target company'
        ]
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        title: 'Engineering Director',
        company: 'StartupXYZ',
        matchScore: 89,
        mutualConnections: 5,
        isOnline: false,
        matchReasons: [
          'Leadership experience',
          'Same tech stack',
          'Industry mentor potential'
        ]
      },
      {
        id: '3',
        name: 'Lisa Wang',
        title: 'UX Design Lead',
        company: 'DesignStudio',
        matchScore: 85,
        mutualConnections: 12,
        isOnline: true,
        matchReasons: [
          'Cross-functional collaboration',
          'Shared design thinking interest',
          'Similar project experience'
        ]
      }
    ]);

    setNetworkInsights([
      { category: 'Software Engineers', count: 145, percentage: 35, color: 'bg-blue-500' },
      { category: 'Product Managers', count: 89, percentage: 22, color: 'bg-green-500' },
      { category: 'Designers', count: 67, percentage: 16, color: 'bg-purple-500' },
      { category: 'Data Scientists', count: 54, percentage: 13, color: 'bg-orange-500' },
      { category: 'Others', count: 58, percentage: 14, color: 'bg-gray-500' }
    ]);

    setRecommendations([
      {
        title: 'Optimize Your Profile',
        description: 'Add 3 more skills to increase match quality by 15%',
        action: 'Add Skills'
      },
      {
        title: 'Weekly Coffee Chat',
        description: 'Schedule 2 networking calls this week for maximum growth',
        action: 'Schedule Now'
      },
      {
        title: 'Join Industry Groups',
        description: '5 relevant groups found that match your interests',
        action: 'View Groups'
      }
    ]);
  }, []);

  const scheduleNetworking = async (config: NetworkingConfig) => {
    setIsLoading(true);
    try {
      // Mock networking scheduling
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to schedule networking:', error);
      setIsLoading(false);
    }
  };

  return {
    intelligentMatches,
    networkInsights,
    recommendations,
    scheduleNetworking,
    isLoading
  };
};