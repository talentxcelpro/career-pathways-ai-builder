import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdvancedAnalyticsRequest {
  userId: string;
  analysisType: 'fraud_detection' | 'pattern_analysis' | 'predictive_insights' | 'optimization';
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  parameters?: Record<string, any>;
}

interface FraudDetectionResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  anomalies: {
    type: string;
    description: string;
    severity: number;
    timestamp: string;
    metadata: Record<string, any>;
  }[];
  recommendations: string[];
}

interface PatternAnalysisResult {
  behavioral_patterns: {
    pattern_type: string;
    confidence: number;
    frequency: string;
    description: string;
    key_insights: string[];
  }[];
  trends: {
    trend_type: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    prediction: string;
  }[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: AdvancedAnalyticsRequest = await req.json();
    const { userId, analysisType, timeRange = 'month', parameters = {} } = requestData;

    console.log(`Starting advanced TXC analytics for user ${userId}, type: ${analysisType}`);

    // Get user's transaction history
    const timeFilter = getTimeFilter(timeRange);
    const { data: transactions, error: txError } = await supabase
      .from('txc_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', timeFilter)
      .order('created_at', { ascending: false });

    if (txError) {
      throw new Error(`Error fetching transactions: ${txError.message}`);
    }

    let analysisResult: any = {};

    switch (analysisType) {
      case 'fraud_detection':
        analysisResult = await performFraudDetection(transactions || [], parameters);
        break;
      
      case 'pattern_analysis':
        analysisResult = await performPatternAnalysis(transactions || [], parameters);
        break;
      
      case 'predictive_insights':
        analysisResult = await generatePredictiveInsights(transactions || [], parameters);
        break;
      
      case 'optimization':
        analysisResult = await analyzeOptimization(transactions || [], parameters);
        break;
      
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    // Log analytics operation
    await supabase
      .from('ai_usage_logs')
      .insert({
        user_id: userId,
        operation_type: `txc_analytics_${analysisType}`,
        input_data: { timeRange, parameters },
        output_data: { 
          summary: `Generated ${analysisType} analysis`,
          result_count: Object.keys(analysisResult).length 
        },
        status: 'completed',
        processing_time_ms: 0
      });

    return new Response(JSON.stringify({
      success: true,
      analysis_type: analysisType,
      user_id: userId,
      time_range: timeRange,
      results: analysisResult,
      generated_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("TXC Advanced Analytics error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        type: 'txc_analytics_error'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getTimeFilter(timeRange: string): string {
  const now = new Date();
  let daysBack = 30; // default to month
  
  switch (timeRange) {
    case 'week':
      daysBack = 7;
      break;
    case 'month':
      daysBack = 30;
      break;
    case 'quarter':
      daysBack = 90;
      break;
    case 'year':
      daysBack = 365;
      break;
  }
  
  return new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString();
}

async function performFraudDetection(transactions: any[], parameters: any): Promise<FraudDetectionResult> {
  const anomalies: any[] = [];
  let riskScore = 0;

  // Check for unusual transaction amounts
  const amounts = transactions.map(t => Math.abs(t.amount));
  const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length);
  
  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.amount);
    const zScore = Math.abs((amount - avgAmount) / stdDev);
    
    if (zScore > 2.5) { // Highly unusual amount
      anomalies.push({
        type: 'unusual_amount',
        description: `Transaction amount ${amount} TXC is significantly higher than usual (${avgAmount.toFixed(0)} TXC average)`,
        severity: Math.min(zScore / 3, 1),
        timestamp: transaction.created_at,
        metadata: { amount, z_score: zScore, average: avgAmount }
      });
      riskScore += 15;
    }
  });

  // Check for rapid succession transactions
  const transactionTimes = transactions.map(t => new Date(t.created_at).getTime());
  for (let i = 1; i < transactionTimes.length; i++) {
    const timeDiff = transactionTimes[i-1] - transactionTimes[i]; // in milliseconds
    if (timeDiff < 60000) { // Less than 1 minute apart
      anomalies.push({
        type: 'rapid_transactions',
        description: 'Multiple transactions within 1 minute detected',
        severity: 0.7,
        timestamp: transactions[i].created_at,
        metadata: { time_difference_ms: timeDiff }
      });
      riskScore += 20;
    }
  }

  // Check for unusual time patterns
  const hours = transactions.map(t => new Date(t.created_at).getHours());
  const nightTransactions = hours.filter(h => h >= 0 && h <= 5).length;
  const nightRatio = nightTransactions / hours.length;
  
  if (nightRatio > 0.3) { // More than 30% of transactions at night
    anomalies.push({
      type: 'unusual_timing',
      description: `${(nightRatio * 100).toFixed(0)}% of transactions occur between midnight and 5 AM`,
      severity: nightRatio,
      timestamp: new Date().toISOString(),
      metadata: { night_ratio: nightRatio, night_count: nightTransactions }
    });
    riskScore += 10;
  }

  // Check for spending pattern anomalies
  const spendingTransactions = transactions.filter(t => t.transaction_type === 'spent');
  const earningTransactions = transactions.filter(t => t.transaction_type === 'earned');
  
  if (spendingTransactions.length > 0 && earningTransactions.length === 0) {
    anomalies.push({
      type: 'only_spending',
      description: 'Only spending transactions detected with no earning activity',
      severity: 0.8,
      timestamp: new Date().toISOString(),
      metadata: { spending_count: spendingTransactions.length }
    });
    riskScore += 25;
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore >= 50) riskLevel = 'critical';
  else if (riskScore >= 30) riskLevel = 'high';
  else if (riskScore >= 15) riskLevel = 'medium';

  const recommendations = generateFraudRecommendations(riskLevel, anomalies);

  return {
    risk_score: Math.min(riskScore, 100),
    risk_level: riskLevel,
    anomalies,
    recommendations
  };
}

async function performPatternAnalysis(transactions: any[], parameters: any): Promise<PatternAnalysisResult> {
  const patterns: any[] = [];
  const trends: any[] = [];

  // Analyze earning patterns
  const earningTx = transactions.filter(t => t.transaction_type === 'earned');
  if (earningTx.length > 0) {
    const earningHours = earningTx.map(t => new Date(t.created_at).getHours());
    const peakHour = earningHours.reduce((a, b, i, arr) => 
      arr.filter(h => h === a).length >= arr.filter(h => h === b).length ? a : b
    );
    
    patterns.push({
      pattern_type: 'earning_timing',
      confidence: 0.8,
      frequency: 'daily',
      description: `Peak earning activity occurs around ${peakHour}:00`,
      key_insights: [
        `Most active earning hour: ${peakHour}:00`,
        `Average earning session: ${(earningTx.length / 7).toFixed(1)} times per week`,
        `Consistency score: ${calculateConsistency(earningTx)}%`
      ]
    });
  }

  // Analyze spending patterns
  const spendingTx = transactions.filter(t => t.transaction_type === 'spent');
  if (spendingTx.length > 0) {
    const avgSpending = spendingTx.reduce((sum, t) => sum + Math.abs(t.amount), 0) / spendingTx.length;
    const spendingFrequency = getFrequencyPattern(spendingTx);
    
    patterns.push({
      pattern_type: 'spending_behavior',
      confidence: 0.7,
      frequency: spendingFrequency,
      description: `Average spending of ${avgSpending.toFixed(0)} TXC per transaction`,
      key_insights: [
        `Spending frequency: ${spendingFrequency}`,
        `Average transaction: ${avgSpending.toFixed(0)} TXC`,
        `Total spent: ${spendingTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)} TXC`
      ]
    });
  }

  // Analyze balance trends
  const weeklyBalanceChange = calculateBalanceTrend(transactions);
  trends.push({
    trend_type: 'balance_trajectory',
    direction: weeklyBalanceChange > 0 ? 'increasing' : weeklyBalanceChange < 0 ? 'decreasing' : 'stable',
    strength: Math.abs(weeklyBalanceChange) / 100, // Normalize to 0-1 scale
    prediction: weeklyBalanceChange > 50 ? 'Strong positive growth' : 
                weeklyBalanceChange < -50 ? 'Concerning decline' : 'Stable balance'
  });

  return {
    behavioral_patterns: patterns,
    trends
  };
}

async function generatePredictiveInsights(transactions: any[], parameters: any) {
  const insights = [];
  
  // Predict next week's balance
  const recentTrend = calculateBalanceTrend(transactions.slice(0, 14)); // Last 2 weeks
  const currentBalance = calculateCurrentBalance(transactions);
  const predictedBalance = currentBalance + recentTrend;
  
  insights.push({
    type: 'balance_prediction',
    timeframe: '7_days',
    prediction: predictedBalance,
    confidence: 0.75,
    description: `Predicted balance in 7 days: ${predictedBalance.toFixed(0)} TXC`,
    factors: ['Recent transaction patterns', 'Historical earning rate', 'Spending trends']
  });

  // Predict optimal earning times
  const earningTimes = transactions
    .filter(t => t.transaction_type === 'earned')
    .map(t => ({ hour: new Date(t.created_at).getHours(), amount: t.amount }));
  
  if (earningTimes.length > 5) {
    const hourlyEarnings = Array(24).fill(0);
    earningTimes.forEach(et => {
      hourlyEarnings[et.hour] += et.amount;
    });
    
    const bestHour = hourlyEarnings.indexOf(Math.max(...hourlyEarnings));
    
    insights.push({
      type: 'optimal_earning_time',
      timeframe: 'daily',
      prediction: bestHour,
      confidence: 0.65,
      description: `Optimal earning time: ${bestHour}:00 - ${bestHour + 1}:00`,
      factors: ['Historical earning data', 'Time-based performance patterns']
    });
  }

  return { predictive_insights: insights };
}

async function analyzeOptimization(transactions: any[], parameters: any) {
  const optimization = {
    efficiency_score: 0,
    optimization_opportunities: [] as any[],
    projected_improvements: {}
  };

  const earning = transactions.filter(t => t.transaction_type === 'earned');
  const spending = transactions.filter(t => t.transaction_type === 'spent');
  
  const totalEarned = earning.reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = spending.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate efficiency
  optimization.efficiency_score = totalEarned > 0 ? ((totalEarned - totalSpent) / totalEarned) * 100 : 0;
  
  // Identify opportunities
  if (spending.length > earning.length) {
    optimization.optimization_opportunities.push({
      type: 'reduce_spending_frequency',
      potential_benefit: '20-30% cost reduction',
      description: 'Consider consolidating smaller purchases',
      priority: 'high'
    });
  }
  
  if (earning.length < 10 && transactions.length > 0) {
    optimization.optimization_opportunities.push({
      type: 'increase_earning_activities',
      potential_benefit: '40-60% more TXC earned',
      description: 'Explore additional earning opportunities',
      priority: 'medium'
    });
  }

  return optimization;
}

function calculateConsistency(transactions: any[]): number {
  const dates = transactions.map(t => new Date(t.created_at).toDateString());
  const uniqueDates = new Set(dates);
  const dayRange = 7; // Week consistency
  return Math.min((uniqueDates.size / dayRange) * 100, 100);
}

function getFrequencyPattern(transactions: any[]): string {
  if (transactions.length === 0) return 'none';
  
  const daySpan = (Date.now() - new Date(transactions[transactions.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24);
  const frequency = transactions.length / daySpan;
  
  if (frequency >= 1) return 'daily';
  if (frequency >= 0.3) return 'frequent';
  if (frequency >= 0.1) return 'weekly';
  return 'occasional';
}

function calculateBalanceTrend(transactions: any[]): number {
  if (transactions.length === 0) return 0;
  
  const earned = transactions.filter(t => t.transaction_type === 'earned').reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions.filter(t => t.transaction_type === 'spent').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return earned - spent;
}

function calculateCurrentBalance(transactions: any[]): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.transaction_type === 'earned') {
      return balance + transaction.amount;
    } else {
      return balance - Math.abs(transaction.amount);
    }
  }, 0);
}

function generateFraudRecommendations(riskLevel: string, anomalies: any[]): string[] {
  const recommendations = [];
  
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Temporarily limit high-value transactions');
    recommendations.push('Enable additional security monitoring');
    recommendations.push('Review and verify recent transaction activity');
  }
  
  if (anomalies.some(a => a.type === 'rapid_transactions')) {
    recommendations.push('Implement transaction rate limiting');
  }
  
  if (anomalies.some(a => a.type === 'unusual_timing')) {
    recommendations.push('Set up alerts for off-hours transaction activity');
  }
  
  recommendations.push('Regular security checkup recommended');
  return recommendations;
}

serve(handler);