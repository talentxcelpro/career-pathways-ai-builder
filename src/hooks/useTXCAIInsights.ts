import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TXCPattern {
  pattern_type: 'earning' | 'spending' | 'transfer';
  frequency: 'daily' | 'weekly' | 'monthly';
  average_amount: number;
  peak_hours: number[];
  confidence_score: number;
  last_occurrence: Date;
}

interface PredictiveInsight {
  insight_type: 'balance_forecast' | 'earning_opportunity' | 'spending_alert' | 'fraud_risk';
  title: string;
  description: string;
  predicted_value?: number;
  confidence_level: 'low' | 'medium' | 'high';
  action_required: boolean;
  expires_at: Date;
  metadata: Record<string, any>;
}

interface TXCForecast {
  period: 'week' | 'month' | 'quarter';
  predicted_balance: number;
  predicted_earnings: number;
  predicted_spending: number;
  confidence_intervals: {
    lower: number;
    upper: number;
  };
  key_factors: string[];
}

export const useTXCAIInsights = () => {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<TXCPattern[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [forecasts, setForecast] = useState<TXCForecast[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const analyzeUserPatterns = useCallback(async () => {
    if (!user?.id) return;

    setIsAnalyzing(true);
    setAnalysisProgress(10);

    try {
      // Get user's transaction history for pattern analysis
      const { data: transactions, error } = await supabase
        .from('txc_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching transactions for analysis:', error);
        return;
      }

      setAnalysisProgress(30);

      if (!transactions || transactions.length === 0) {
        setPatterns([]);
        setInsights([]);
        setForecast([]);
        return;
      }

      // Analyze earning patterns
      const earningTransactions = transactions.filter(t => t.transaction_type === 'earned');
      const spendingTransactions = transactions.filter(t => t.transaction_type === 'spent');
      const transferTransactions = transactions.filter(t => t.transaction_type === 'transferred');

      setAnalysisProgress(50);

      // Calculate patterns
      const calculatedPatterns: TXCPattern[] = [];

      // Earning pattern analysis
      if (earningTransactions.length > 0) {
        const avgEarning = earningTransactions.reduce((sum, t) => sum + t.amount, 0) / earningTransactions.length;
        const earningHours = earningTransactions.map(t => new Date(t.created_at).getHours());
        const peakHours = getMostFrequentHours(earningHours);
        
        calculatedPatterns.push({
          pattern_type: 'earning',
          frequency: getTransactionFrequency(earningTransactions),
          average_amount: avgEarning,
          peak_hours: peakHours,
          confidence_score: calculateConfidenceScore(earningTransactions),
          last_occurrence: new Date(earningTransactions[0].created_at)
        });
      }

      setAnalysisProgress(70);

      // Spending pattern analysis
      if (spendingTransactions.length > 0) {
        const avgSpending = spendingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / spendingTransactions.length;
        const spendingHours = spendingTransactions.map(t => new Date(t.created_at).getHours());
        const peakHours = getMostFrequentHours(spendingHours);
        
        calculatedPatterns.push({
          pattern_type: 'spending',
          frequency: getTransactionFrequency(spendingTransactions),
          average_amount: avgSpending,
          peak_hours: peakHours,
          confidence_score: calculateConfidenceScore(spendingTransactions),
          last_occurrence: new Date(spendingTransactions[0].created_at)
        });
      }

      setPatterns(calculatedPatterns);
      setAnalysisProgress(85);

      // Generate AI insights based on patterns
      const generatedInsights = await generatePredictiveInsights(transactions, calculatedPatterns);
      setInsights(generatedInsights);

      setAnalysisProgress(95);

      // Generate forecasts
      const generatedForecasts = await generateTXCForecasts(transactions, calculatedPatterns);
      setForecast(generatedForecasts);

      setAnalysisProgress(100);

    } catch (error) {
      console.error('Error analyzing TXC patterns:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  }, [user?.id]);

  const getMostFrequentHours = (hours: number[]): number[] => {
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const sortedHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return sortedHours;
  };

  const getTransactionFrequency = (transactions: any[]): 'daily' | 'weekly' | 'monthly' => {
    if (transactions.length < 2) return 'monthly';

    const dates = transactions.map(t => new Date(t.created_at).toDateString());
    const uniqueDates = [...new Set(dates)];
    const daysBetween = (Date.now() - new Date(transactions[transactions.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24);
    
    const avgFrequency = daysBetween / transactions.length;
    
    if (avgFrequency <= 1.5) return 'daily';
    if (avgFrequency <= 7) return 'weekly';
    return 'monthly';
  };

  const calculateConfidenceScore = (transactions: any[]): number => {
    if (transactions.length < 3) return 0.3;
    if (transactions.length < 10) return 0.6;
    if (transactions.length < 30) return 0.8;
    return 0.9;
  };

  const generatePredictiveInsights = async (transactions: any[], patterns: TXCPattern[]): Promise<PredictiveInsight[]> => {
    const insights: PredictiveInsight[] = [];
    const now = new Date();

    // Balance forecast insight
    const recentBalance = await getCurrentBalance();
    const earningPattern = patterns.find(p => p.pattern_type === 'earning');
    const spendingPattern = patterns.find(p => p.pattern_type === 'spending');

    if (earningPattern && spendingPattern) {
      const weeklyEarning = earningPattern.average_amount * (earningPattern.frequency === 'daily' ? 7 : earningPattern.frequency === 'weekly' ? 1 : 0.25);
      const weeklySpending = spendingPattern.average_amount * (spendingPattern.frequency === 'daily' ? 7 : spendingPattern.frequency === 'weekly' ? 1 : 0.25);
      const predictedBalance = recentBalance + (weeklyEarning - weeklySpending);

      insights.push({
        insight_type: 'balance_forecast',
        title: 'Weekly Balance Forecast',
        description: `Based on your patterns, your balance next week is predicted to be ${predictedBalance.toFixed(0)} TXC`,
        predicted_value: predictedBalance,
        confidence_level: earningPattern.confidence_score > 0.7 ? 'high' : 'medium',
        action_required: predictedBalance < 100,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        metadata: { weekly_earning: weeklyEarning, weekly_spending: weeklySpending }
      });
    }

    // Earning opportunity insight
    if (earningPattern && earningPattern.peak_hours.length > 0) {
      const nextPeakHour = earningPattern.peak_hours[0];
      insights.push({
        insight_type: 'earning_opportunity',
        title: 'Optimal Earning Time',
        description: `You typically earn the most TXC around ${nextPeakHour}:00. Consider being active during this time.`,
        confidence_level: earningPattern.confidence_score > 0.8 ? 'high' : 'medium',
        action_required: false,
        expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        metadata: { peak_hours: earningPattern.peak_hours, average_amount: earningPattern.average_amount }
      });
    }

    // Fraud risk detection
    const recentTransactions = transactions.slice(0, 10);
    const unusualAmounts = recentTransactions.filter(t => Math.abs(t.amount) > 1000);
    if (unusualAmounts.length > 2) {
      insights.push({
        insight_type: 'fraud_risk',
        title: 'Unusual Activity Detected',
        description: 'We detected several high-value transactions. Please verify these are legitimate.',
        confidence_level: 'high',
        action_required: true,
        expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        metadata: { unusual_count: unusualAmounts.length, max_amount: Math.max(...unusualAmounts.map(t => Math.abs(t.amount))) }
      });
    }

    return insights;
  };

  const generateTXCForecasts = async (transactions: any[], patterns: TXCPattern[]): Promise<TXCForecast[]> => {
    const forecasts: TXCForecast[] = [];
    const earningPattern = patterns.find(p => p.pattern_type === 'earning');
    const spendingPattern = patterns.find(p => p.pattern_type === 'spending');

    if (!earningPattern || !spendingPattern) return forecasts;

    // Weekly forecast
    const weeklyEarning = earningPattern.average_amount * (earningPattern.frequency === 'daily' ? 7 : 1);
    const weeklySpending = spendingPattern.average_amount * (spendingPattern.frequency === 'daily' ? 7 : 1);
    const currentBalance = await getCurrentBalance();
    
    forecasts.push({
      period: 'week',
      predicted_balance: currentBalance + (weeklyEarning - weeklySpending),
      predicted_earnings: weeklyEarning,
      predicted_spending: weeklySpending,
      confidence_intervals: {
        lower: currentBalance + (weeklyEarning - weeklySpending) * 0.8,
        upper: currentBalance + (weeklyEarning - weeklySpending) * 1.2
      },
      key_factors: ['Historical earning patterns', 'Spending consistency', 'Activity frequency']
    });

    // Monthly forecast
    const monthlyEarning = weeklyEarning * 4.33;
    const monthlySpending = weeklySpending * 4.33;
    
    forecasts.push({
      period: 'month',
      predicted_balance: currentBalance + (monthlyEarning - monthlySpending),
      predicted_earnings: monthlyEarning,
      predicted_spending: monthlySpending,
      confidence_intervals: {
        lower: currentBalance + (monthlyEarning - monthlySpending) * 0.7,
        upper: currentBalance + (monthlyEarning - monthlySpending) * 1.3
      },
      key_factors: ['Monthly activity trends', 'Seasonal variations', 'Historical consistency']
    });

    return forecasts;
  };

  const getCurrentBalance = async (): Promise<number> => {
    if (!user?.id) return 0;
    
    try {
      const { data, error } = await supabase
        .from('user_txc_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      return data?.balance || 0;
    } catch (error) {
      return 0;
    }
  };

  const dismissInsight = useCallback(async (insightIndex: number) => {
    setInsights(prev => prev.filter((_, index) => index !== insightIndex));
  }, []);

  const refreshAnalysis = useCallback(() => {
    analyzeUserPatterns();
  }, [analyzeUserPatterns]);

  useEffect(() => {
    if (user?.id) {
      analyzeUserPatterns();
    }
  }, [user?.id, analyzeUserPatterns]);

  return {
    patterns,
    insights,
    forecasts,
    isAnalyzing,
    analysisProgress,
    dismissInsight,
    refreshAnalysis
  };
};