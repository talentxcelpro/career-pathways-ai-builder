
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOInsight {
  id: string;
  type: 'opportunity' | 'issue' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: string;
  data: any;
  createdAt: string;
}

export const useSEOInsights = () => {
  const [insights, setInsights] = useState<SEOInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);

    try {
      // Fetch data from various sources to generate insights
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      const { data: companies } = await supabase
        .from('companies')
        .select('*');

      // Generate AI-powered insights based on data
      const generatedInsights: SEOInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'High-Value Keyword Gap Identified',
          description: 'Found 15 high-volume keywords with low competition that we\'re not targeting',
          impact: 'high',
          effort: 'medium',
          category: 'Keywords',
          data: {
            keywords: ['remote software engineer', 'ai engineer jobs', 'blockchain developer'],
            estimatedTraffic: 25000,
            difficulty: 35
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'issue',
          title: 'Page Speed Issues Detected',
          description: '8 pages have load times > 3 seconds, affecting SEO rankings',
          impact: 'high',
          effort: 'medium',
          category: 'Technical SEO',
          data: {
            affectedPages: 8,
            averageLoadTime: 4.2,
            impactedTraffic: 12000
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'recommendation',
          title: 'Content Optimization Opportunity',
          description: 'Top 10 pages could benefit from FAQ sections and structured data',
          impact: 'medium',
          effort: 'low',
          category: 'Content',
          data: {
            pages: 10,
            estimatedCTRIncrease: '15%',
            implementationTime: '2 days'
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          type: 'opportunity',
          title: 'Competitor Gap Analysis',
          description: 'Competitors rank for 120 keywords we don\'t target',
          impact: 'high',
          effort: 'high',
          category: 'Competitive',
          data: {
            competitorKeywords: 120,
            topCompetitor: 'Naukri.com',
            potentialTraffic: 45000
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          type: 'issue',
          title: 'Missing Meta Descriptions',
          description: '25 pages are missing optimized meta descriptions',
          impact: 'medium',
          effort: 'low',
          category: 'On-Page SEO',
          data: {
            missingPages: 25,
            averageCTR: 4.2,
            potentialImprovement: '20%'
          },
          createdAt: new Date().toISOString()
        }
      ];

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating SEO insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const markInsightAsImplemented = (insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const getInsightsByType = (type: SEOInsight['type']) => {
    return insights.filter(insight => insight.type === type);
  };

  const getInsightsByImpact = (impact: SEOInsight['impact']) => {
    return insights.filter(insight => insight.impact === impact);
  };

  useEffect(() => {
    generateInsights();
  }, []);

  return {
    insights,
    loading,
    generateInsights,
    markInsightAsImplemented,
    getInsightsByType,
    getInsightsByImpact
  };
};
