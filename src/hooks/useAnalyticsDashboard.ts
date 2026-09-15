import { useState, useEffect } from 'react';

interface Analytics {
  totalViews: number;
  totalFollowers: number;
  engagementRate: number;
  totalPosts: number;
  viewsGrowth: number;
  followersGrowth: number;
  engagementGrowth: number;
  avgPostsPerWeek: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    created_at: string;
  }>;
  audienceDemographics: Array<{
    category: string;
    percentage: number;
  }>;
  peakHours: Array<{
    time: string;
    activity: number;
  }>;
}

export const useAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    totalFollowers: 0,
    engagementRate: 0,
    totalPosts: 0,
    viewsGrowth: 0,
    followersGrowth: 0,
    engagementGrowth: 0,
    avgPostsPerWeek: 0,
    topPosts: [],
    audienceDemographics: [],
    peakHours: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock analytics data
    setTimeout(() => {
      setAnalytics({
        totalViews: 15420,
        totalFollowers: 1250,
        engagementRate: 4.2,
        totalPosts: 38,
        viewsGrowth: 12.5,
        followersGrowth: 8.3,
        engagementGrowth: 5.7,
        avgPostsPerWeek: 9,
        topPosts: [
          {
            id: '1',
            title: '5 Essential Career Tips for New Graduates',
            views: 2450,
            likes: 89,
            comments: 24,
            shares: 15,
            created_at: '2024-01-15'
          },
          {
            id: '2',
            title: 'How I Landed My Dream Job at Tech Company',
            views: 1980,
            likes: 156,
            comments: 43,
            shares: 28,
            created_at: '2024-01-12'
          },
          {
            id: '3',
            title: 'Resume Writing Tips That Actually Work',
            views: 1750,
            likes: 98,
            comments: 31,
            shares: 19,
            created_at: '2024-01-10'
          }
        ],
        audienceDemographics: [
          { category: 'Software Engineers', percentage: 35 },
          { category: 'Product Managers', percentage: 25 },
          { category: 'Designers', percentage: 20 },
          { category: 'Data Scientists', percentage: 12 },
          { category: 'Others', percentage: 8 }
        ],
        peakHours: [
          { time: '9:00 AM', activity: 85 },
          { time: '12:00 PM', activity: 92 },
          { time: '3:00 PM', activity: 78 },
          { time: '6:00 PM', activity: 95 },
          { time: '9:00 PM', activity: 67 }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return {
    analytics,
    isLoading
  };
};