import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CareerMetric {
  id: string;
  user_id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  previous_value: number;
  change_percentage: number;
  metric_data: any;
  calculated_at: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export const useCareerMetrics = () => {
  const [metrics, setMetrics] = useState<CareerMetric[]>([]);
  const [careerScore, setCareerScore] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [marketRank, setMarketRank] = useState(0);
  const [opportunities, setOpportunities] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCareerMetrics();
  }, []);

  const fetchCareerMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('career_intelligence_metrics')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (error) throw error;
      
      const metricsList = data || [];
      setMetrics(metricsList);
      
      // Calculate key metrics from data
      const careerScoreMetric = metricsList.find(m => m.metric_name === 'career_score');
      const growthMetric = metricsList.find(m => m.metric_name === 'growth_rate');
      const rankMetric = metricsList.find(m => m.metric_name === 'market_rank');
      const opportunityMetric = metricsList.find(m => m.metric_name === 'opportunities');
      
      setCareerScore(careerScoreMetric?.metric_value || 0);
      setGrowthRate(growthMetric?.change_percentage || 0);
      setMarketRank(rankMetric?.metric_value || 0);
      setOpportunities(opportunityMetric?.metric_value || 0);
      
    } catch (error) {
      console.error('Error fetching career metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch career metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = async (metricData: Partial<CareerMetric>) => {
    try {
      const { data, error } = await supabase
        .from('career_intelligence_metrics')
        .insert([metricData])
        .select()
        .single();

      if (error) throw error;
      
      setMetrics(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error updating metric:', error);
      throw error;
    }
  };

  return {
    metrics,
    careerScore,
    growthRate,
    marketRank,
    opportunities,
    loading,
    fetchCareerMetrics,
    updateMetric
  };
};