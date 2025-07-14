import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ABTest = {
  id: string;
  resume_id: string;
  user_id: string;
  test_name: string;
  variant_a: any; // Original version
  variant_b: any; // Test version
  traffic_split: number;
  status: 'active' | 'paused' | 'completed';
  start_date: string;
  end_date?: string;
  winner_variant?: 'a' | 'b';
  created_at: string;
};

export type ABTestResult = {
  id: string;
  test_id: string;
  variant: 'a' | 'b';
  metric_type: 'view' | 'download' | 'apply' | 'response';
  metric_value: number;
  recorded_at: string;
};

export type ABTestMetrics = {
  variant_a: {
    views: number;
    downloads: number;
    applications: number;
    responses: number;
    conversionRate: number;
  };
  variant_b: {
    views: number;
    downloads: number;
    applications: number;
    responses: number;
    conversionRate: number;
  };
  significance: number;
  recommendedWinner?: 'a' | 'b';
};

export const useResumeABTesting = (resumeId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch A/B tests
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['resume-ab-tests', resumeId],
    queryFn: async (): Promise<ABTest[]> => {
      if (!resumeId || !user) return [];
      
      const { data, error } = await supabase
        .from('resume_ab_tests')
        .select('*')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        status: item.status as ABTest['status'],
        winner_variant: item.winner_variant as 'a' | 'b' | undefined
      }));
    },
    enabled: !!resumeId && !!user
  });

  // Fetch test results for a specific test
  const useTestResults = (testId?: string) => {
    return useQuery({
      queryKey: ['ab-test-results', testId],
      queryFn: async (): Promise<ABTestResult[]> => {
        if (!testId) return [];
        
        const { data, error } = await supabase
          .from('resume_ab_results')
          .select('*')
          .eq('test_id', testId)
          .order('recorded_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(item => ({
          ...item,
          variant: item.variant as 'a' | 'b',
          metric_type: item.metric_type as ABTestResult['metric_type']
        }));
      },
      enabled: !!testId
    });
  };

  // Calculate metrics from results
  const calculateMetrics = (results: ABTestResult[]): ABTestMetrics => {
    const variantA = results.filter(r => r.variant === 'a');
    const variantB = results.filter(r => r.variant === 'b');

    const getMetrics = (results: ABTestResult[]) => {
      const views = results.filter(r => r.metric_type === 'view').length;
      const downloads = results.filter(r => r.metric_type === 'download').length;
      const applications = results.filter(r => r.metric_type === 'apply').length;
      const responses = results.filter(r => r.metric_type === 'response').length;
      const conversionRate = views > 0 ? (applications / views) * 100 : 0;

      return { views, downloads, applications, responses, conversionRate };
    };

    const metricsA = getMetrics(variantA);
    const metricsB = getMetrics(variantB);

    // Simple statistical significance calculation (basic z-test)
    const pooledRate = (metricsA.applications + metricsB.applications) / 
                       (metricsA.views + metricsB.views);
    const se = Math.sqrt(pooledRate * (1 - pooledRate) * 
                        (1/metricsA.views + 1/metricsB.views));
    const zScore = Math.abs((metricsA.conversionRate/100) - (metricsB.conversionRate/100)) / se;
    const significance = (1 - 2 * (1 - normalCDF(Math.abs(zScore)))) * 100;

    const recommendedWinner = significance > 95 ? 
      (metricsB.conversionRate > metricsA.conversionRate ? 'b' : 'a') : 
      undefined;

    return {
      variant_a: metricsA,
      variant_b: metricsB,
      significance,
      recommendedWinner
    };
  };

  // Helper function for normal CDF (approximation)
  const normalCDF = (x: number): number => {
    return (1 + erf(x / Math.sqrt(2))) / 2;
  };

  const erf = (x: number): number => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  // Create A/B test mutation
  const createTest = useMutation({
    mutationFn: async ({ 
      testName, 
      variantB, 
      trafficSplit = 0.5 
    }: {
      testName: string;
      variantB: any;
      trafficSplit?: number;
    }) => {
      if (!resumeId || !user) throw new Error('Missing required data');

      // Get current resume content as variant A
      const { data: resume, error: resumeError } = await supabase
        .from('ai_resumes')
        .select('content')
        .eq('id', resumeId)
        .single();

      if (resumeError) throw resumeError;

      const { error } = await supabase
        .from('resume_ab_tests')
        .insert({
          resume_id: resumeId,
          user_id: user.id,
          test_name: testName,
          variant_a: resume.content,
          variant_b: variantB,
          traffic_split: trafficSplit,
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('A/B test created successfully');
      queryClient.invalidateQueries({ queryKey: ['resume-ab-tests', resumeId] });
    }
  });

  // Update test status mutation
  const updateTestStatus = useMutation({
    mutationFn: async ({ 
      testId, 
      status,
      winnerVariant
    }: {
      testId: string;
      status: ABTest['status'];
      winnerVariant?: 'a' | 'b';
    }) => {
      const updateData: any = { status };
      if (status === 'completed' && winnerVariant) {
        updateData.winner_variant = winnerVariant;
        updateData.end_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('resume_ab_tests')
        .update(updateData)
        .eq('id', testId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Test status updated');
      queryClient.invalidateQueries({ queryKey: ['resume-ab-tests', resumeId] });
    }
  });

  // Record test result mutation
  const recordResult = useMutation({
    mutationFn: async ({ 
      testId, 
      variant, 
      metricType, 
      metricValue 
    }: {
      testId: string;
      variant: 'a' | 'b';
      metricType: ABTestResult['metric_type'];
      metricValue: number;
    }) => {
      const { error } = await supabase
        .from('resume_ab_results')
        .insert({
          test_id: testId,
          variant,
          metric_type: metricType,
          metric_value: metricValue
        });

      if (error) throw error;
    }
  });

  // Delete test mutation
  const deleteTest = useMutation({
    mutationFn: async (testId: string) => {
      const { error } = await supabase
        .from('resume_ab_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Test deleted');
      queryClient.invalidateQueries({ queryKey: ['resume-ab-tests', resumeId] });
    }
  });

  return {
    tests,
    isLoading: testsLoading,
    createTest: createTest.mutate,
    updateTestStatus: updateTestStatus.mutate,
    recordResult: recordResult.mutate,
    deleteTest: deleteTest.mutate,
    useTestResults,
    calculateMetrics,
    isCreating: createTest.isPending
  };
};