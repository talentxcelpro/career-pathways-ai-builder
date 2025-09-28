import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SmartRecommendation {
  id: string;
  type: 'earning' | 'saving' | 'spending' | 'investment';
  title: string;
  description: string;
  expected_benefit: number;
  effort_level: 'low' | 'medium' | 'high';
  time_to_complete: string;
  confidence_score: number;
  action_items: string[];
  is_personalized: boolean;
  expires_at: Date;
  metadata: Record<string, any>;
}

interface EarningOpportunity {
  activity_type: string;
  estimated_txc: number;
  time_window: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: string[];
  description: string;
}

interface TXCOptimization {
  current_efficiency: number;
  potential_efficiency: number;
  optimization_areas: {
    area: string;
    current_score: number;
    potential_improvement: number;
    action_required: string;
  }[];
  estimated_monthly_gain: number;
}

export const useTXCSmartRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [earningOpportunities, setEarningOpportunities] = useState<EarningOpportunity[]>([]);
  const [optimization, setOptimization] = useState<TXCOptimization | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSmartRecommendations = useCallback(async () => {
    if (!user?.id) return;

    setIsGenerating(true);

    try {
      // Get user's TXC data for analysis
      const [transactionsResult, balanceResult] = await Promise.all([
        supabase
          .from('txc_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
        
        supabase
          .from('user_txc_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single()
      ]);

      const transactions = transactionsResult.data || [];
      const currentBalance = balanceResult.data?.balance || 0;

      // Generate personalized earning opportunities
      const opportunities = await generateEarningOpportunities(transactions, currentBalance);
      setEarningOpportunities(opportunities);

      // Generate smart recommendations
      const smartRecs = await generatePersonalizedRecommendations(transactions, currentBalance, opportunities);
      setRecommendations(smartRecs);

      // Generate optimization analysis
      const optimizationAnalysis = await analyzeOptimizationPotential(transactions, currentBalance);
      setOptimization(optimizationAnalysis);

    } catch (error) {
      console.error('Error generating smart recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id]);

  const generateEarningOpportunities = async (
    transactions: any[], 
    currentBalance: number
  ): Promise<EarningOpportunity[]> => {
    const opportunities: EarningOpportunity[] = [];
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentEarnings = transactions.filter(t => 
      t.transaction_type === 'earned' && new Date(t.created_at) > lastWeek
    );

    // Analyze activity patterns
    const activityTypes = [...new Set(recentEarnings.map(t => t.activity_type).filter(Boolean))];
    
    // Generate opportunities based on current activity
    if (activityTypes.includes('profile_completion')) {
      opportunities.push({
        activity_type: 'profile_optimization',
        estimated_txc: 150,
        time_window: '15 minutes',
        difficulty: 'easy',
        requirements: ['Complete missing profile sections', 'Add profile picture', 'Update skills'],
        description: 'Optimize your profile to earn bonus TXC and improve visibility'
      });
    }

    if (activityTypes.includes('job_application')) {
      opportunities.push({
        activity_type: 'application_streak',
        estimated_txc: 300,
        time_window: '1 week',
        difficulty: 'medium',
        requirements: ['Apply to 5 jobs consecutively', 'Customize each application'],
        description: 'Build an application streak for bonus TXC rewards'
      });
    }

    // Daily activity opportunities
    const dailyActivity = recentEarnings.filter(t => 
      new Date(t.created_at).toDateString() === now.toDateString()
    );

    if (dailyActivity.length === 0) {
      opportunities.push({
        activity_type: 'daily_login',
        estimated_txc: 50,
        time_window: '5 minutes',
        difficulty: 'easy',
        requirements: ['Log in daily', 'Check dashboard'],
        description: 'Start your daily TXC earning streak'
      });
    }

    // Skill-based opportunities
    if (currentBalance < 500) {
      opportunities.push({
        activity_type: 'skill_assessment',
        estimated_txc: 200,
        time_window: '30 minutes',
        difficulty: 'medium',
        requirements: ['Complete skill assessments', 'Achieve 80% score'],
        description: 'Demonstrate your skills to earn TXC and boost profile credibility'
      });
    }

    // Network building opportunities
    opportunities.push({
      activity_type: 'networking',
      estimated_txc: 100,
      time_window: '20 minutes',
      difficulty: 'easy',
      requirements: ['Connect with 3 professionals', 'Send personalized messages'],
      description: 'Build your professional network while earning TXC'
    });

    return opportunities.slice(0, 5); // Return top 5 opportunities
  };

  const generatePersonalizedRecommendations = async (
    transactions: any[], 
    currentBalance: number,
    opportunities: EarningOpportunity[]
  ): Promise<SmartRecommendation[]> => {
    const recommendations: SmartRecommendation[] = [];
    const now = new Date();

    // Balance-based recommendations
    if (currentBalance < 100) {
      recommendations.push({
        id: `balance_boost_${Date.now()}`,
        type: 'earning',
        title: 'Boost Your TXC Balance',
        description: 'Your TXC balance is running low. Complete profile optimization and daily activities to quickly earn more.',
        expected_benefit: 250,
        effort_level: 'low',
        time_to_complete: '30 minutes',
        confidence_score: 0.9,
        action_items: [
          'Complete your profile',
          'Apply to 2 jobs today',
          'Connect with 3 professionals'
        ],
        is_personalized: true,
        expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        metadata: { current_balance: currentBalance, target_balance: 350 }
      });
    }

    // Spending optimization
    const recentSpending = transactions
      .filter(t => t.transaction_type === 'spent')
      .slice(0, 10);

    if (recentSpending.length > 5) {
      const avgSpending = recentSpending.reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentSpending.length;
      
      if (avgSpending > 50) {
        recommendations.push({
          id: `spending_opt_${Date.now()}`,
          type: 'saving',
          title: 'Optimize Your TXC Spending',
          description: `You're spending an average of ${avgSpending.toFixed(0)} TXC per transaction. Consider using free features first.`,
          expected_benefit: avgSpending * 0.3,
          effort_level: 'low',
          time_to_complete: '10 minutes',
          confidence_score: 0.7,
          action_items: [
            'Review premium features usage',
            'Use free alternatives when possible',
            'Set spending alerts'
          ],
          is_personalized: true,
          expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          metadata: { avg_spending: avgSpending, suggested_limit: avgSpending * 0.7 }
        });
      }
    }

    // Earning streak recommendations
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    const earningDays = last7Days.filter(day => 
      transactions.some(t => 
        t.transaction_type === 'earned' && 
        new Date(t.created_at).toDateString() === day
      )
    );

    if (earningDays.length >= 3) {
      recommendations.push({
        id: `streak_maintain_${Date.now()}`,
        type: 'earning',
        title: 'Maintain Your Earning Streak',
        description: `Great job! You've earned TXC on ${earningDays.length} of the last 7 days. Keep the momentum going!`,
        expected_benefit: 500,
        effort_level: 'medium',
        time_to_complete: '1 week',
        confidence_score: 0.8,
        action_items: [
          'Continue daily activities',
          'Set daily earning goals',
          'Track your progress'
        ],
        is_personalized: true,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        metadata: { streak_days: earningDays.length, bonus_multiplier: 1.5 }
      });
    }

    // Investment recommendations (if high balance)
    if (currentBalance > 1000) {
      recommendations.push({
        id: `investment_${Date.now()}`,
        type: 'investment',
        title: 'Invest in Premium Features',
        description: 'With your high TXC balance, consider investing in premium features to accelerate your career growth.',
        expected_benefit: currentBalance * 0.2,
        effort_level: 'low',
        time_to_complete: '5 minutes',
        confidence_score: 0.6,
        action_items: [
          'Explore premium job matching',
          'Try AI resume optimization',
          'Unlock advanced analytics'
        ],
        is_personalized: true,
        expires_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        metadata: { available_balance: currentBalance, suggested_investment: Math.min(currentBalance * 0.1, 200) }
      });
    }

    return recommendations;
  };

  const analyzeOptimizationPotential = async (
    transactions: any[], 
    currentBalance: number
  ): Promise<TXCOptimization> => {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t => new Date(t.created_at) > last30Days);
    
    const monthlyEarning = recentTransactions
      .filter(t => t.transaction_type === 'earned')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlySpending = recentTransactions
      .filter(t => t.transaction_type === 'spent')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentEfficiency = monthlyEarning > 0 ? (monthlyEarning - monthlySpending) / monthlyEarning : 0;
    const potentialEfficiency = Math.min(currentEfficiency + 0.3, 0.9); // 30% improvement cap

    const optimizationAreas = [
      {
        area: 'Daily Activity Consistency',
        current_score: calculateActivityConsistency(recentTransactions),
        potential_improvement: 25,
        action_required: 'Maintain daily login streaks and complete daily tasks'
      },
      {
        area: 'Smart Spending',
        current_score: calculateSpendingEfficiency(recentTransactions),
        potential_improvement: 40,
        action_required: 'Focus on high-value features and avoid unnecessary purchases'
      },
      {
        area: 'Earning Diversification',
        current_score: calculateEarningDiversity(recentTransactions),
        potential_improvement: 30,
        action_required: 'Explore different earning activities and maximize opportunities'
      }
    ];

    return {
      current_efficiency: currentEfficiency,
      potential_efficiency: potentialEfficiency,
      optimization_areas: optimizationAreas,
      estimated_monthly_gain: (potentialEfficiency - currentEfficiency) * monthlyEarning
    };
  };

  const calculateActivityConsistency = (transactions: any[]): number => {
    const activeDays = [...new Set(transactions.map(t => new Date(t.created_at).toDateString()))];
    return Math.min((activeDays.length / 30) * 100, 100);
  };

  const calculateSpendingEfficiency = (transactions: any[]): number => {
    const spending = transactions.filter(t => t.transaction_type === 'spent');
    if (spending.length === 0) return 100;
    
    const highValueSpending = spending.filter(t => Math.abs(t.amount) > 100).length;
    return Math.max(100 - (highValueSpending / spending.length) * 50, 0);
  };

  const calculateEarningDiversity = (transactions: any[]): number => {
    const earning = transactions.filter(t => t.transaction_type === 'earned');
    const activityTypes = [...new Set(earning.map(t => t.activity_type).filter(Boolean))];
    return Math.min((activityTypes.length / 5) * 100, 100);
  };

  const dismissRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
  }, []);

  const markOpportunityCompleted = useCallback((activityType: string) => {
    setEarningOpportunities(prev => prev.filter(o => o.activity_type !== activityType));
  }, []);

  useEffect(() => {
    if (user?.id) {
      generateSmartRecommendations();
    }
  }, [user?.id, generateSmartRecommendations]);

  return {
    recommendations,
    earningOpportunities,
    optimization,
    isGenerating,
    generateSmartRecommendations,
    dismissRecommendation,
    markOpportunityCompleted
  };
};