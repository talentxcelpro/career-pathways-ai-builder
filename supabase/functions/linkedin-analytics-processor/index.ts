import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    switch (action) {
      case 'process-analytics':
        return await processAnalytics(payload);
      case 'generate-insights':
        return await generateInsights(payload);
      case 'calculate-metrics':
        return await calculateMetrics(payload);
      case 'update-trends':
        return await updateTrends(payload);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Analytics processor error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processAnalytics(payload: any) {
  console.log('Processing LinkedIn analytics:', payload);
  
  const { date_range = '7d', metrics = ['imports', 'quality', 'sources'] } = payload;
  
  const analytics = {};
  
  if (metrics.includes('imports')) {
    analytics.imports = await calculateImportMetrics(date_range);
  }
  
  if (metrics.includes('quality')) {
    analytics.quality = await calculateQualityMetrics();
  }
  
  if (metrics.includes('sources')) {
    analytics.sources = await calculateSourceMetrics();
  }
  
  if (metrics.includes('trends')) {
    analytics.trends = await calculateTrendMetrics(date_range);
  }
  
  // Store analytics data
  await supabase
    .from('linkedin_analytics')
    .insert({
      analytics_date: new Date().toISOString().split('T')[0],
      metrics_data: analytics,
      processed_at: new Date().toISOString()
    });
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      analytics,
      processed_at: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateImportMetrics(dateRange: string) {
  const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  const [
    { count: totalImports },
    { count: successfulImports },
    { count: failedImports },
    { data: dailyImports }
  ] = await Promise.all([
    supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString()),
    supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
      .eq('status', 'completed').gte('created_at', startDate.toISOString()),
    supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
      .eq('status', 'failed').gte('created_at', startDate.toISOString()),
    supabase.from('linkedin_import_jobs').select('created_at, status')
      .gte('created_at', startDate.toISOString()).order('created_at', { ascending: true })
  ]);
  
  const successRate = totalImports > 0 ? Math.round((successfulImports / totalImports) * 100) : 0;
  
  // Group by date for trends
  const trendData = {};
  dailyImports?.forEach(job => {
    const date = job.created_at.split('T')[0];
    if (!trendData[date]) {
      trendData[date] = { total: 0, success: 0, failed: 0 };
    }
    trendData[date].total++;
    if (job.status === 'completed') trendData[date].success++;
    if (job.status === 'failed') trendData[date].failed++;
  });
  
  return {
    total_imports: totalImports || 0,
    successful_imports: successfulImports || 0,
    failed_imports: failedImports || 0,
    success_rate: successRate,
    trend_data: trendData
  };
}

async function calculateQualityMetrics() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('full_name, email, linkedin_url, title, about, location, skills')
    .limit(1000);
  
  if (!profiles || profiles.length === 0) {
    return {
      profile_completeness: 0,
      email_validation: 0,
      linkedin_url_validation: 0,
      skills_completeness: 0,
      total_profiles: 0
    };
  }
  
  const metrics = profiles.reduce((acc, profile) => {
    let completeness = 0;
    if (profile.full_name) completeness += 20;
    if (profile.email) completeness += 20;
    if (profile.title) completeness += 20;
    if (profile.about) completeness += 20;
    if (profile.location) completeness += 20;
    
    acc.total_completeness += completeness;
    
    if (profile.email && profile.email.includes('@')) acc.valid_emails++;
    if (profile.linkedin_url && profile.linkedin_url.includes('linkedin.com')) acc.valid_linkedin++;
    if (profile.skills && profile.skills.length > 0) acc.has_skills++;
    
    return acc;
  }, {
    total_completeness: 0,
    valid_emails: 0,
    valid_linkedin: 0,
    has_skills: 0
  });
  
  return {
    profile_completeness: Math.round(metrics.total_completeness / profiles.length),
    email_validation: Math.round((metrics.valid_emails / profiles.length) * 100),
    linkedin_url_validation: Math.round((metrics.valid_linkedin / profiles.length) * 100),
    skills_completeness: Math.round((metrics.has_skills / profiles.length) * 100),
    total_profiles: profiles.length
  };
}

async function calculateSourceMetrics() {
  const { data: importJobs } = await supabase
    .from('linkedin_import_jobs')
    .select('import_type, source_url')
    .not('import_type', 'is', null);
  
  const sources = {};
  importJobs?.forEach(job => {
    const source = job.import_type || 'unknown';
    sources[source] = (sources[source] || 0) + 1;
  });
  
  const total = Object.values(sources).reduce((sum: number, count: number) => sum + count, 0);
  
  return Object.entries(sources).map(([source, count]) => ({
    source: source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: count as number,
    percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0
  }));
}

async function calculateTrendMetrics(dateRange: string) {
  const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 7;
  const dates = [];
  
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  const trends = await Promise.all(dates.map(async (date) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const [
      { count: imports },
      { count: success },
      { count: failed }
    ] = await Promise.all([
      supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
        .gte('created_at', date).lt('created_at', nextDate.toISOString().split('T')[0]),
      supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
        .eq('status', 'completed').gte('created_at', date).lt('created_at', nextDate.toISOString().split('T')[0]),
      supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
        .eq('status', 'failed').gte('created_at', date).lt('created_at', nextDate.toISOString().split('T')[0])
    ]);
    
    return {
      date,
      imports: imports || 0,
      success: success || 0,
      failed: failed || 0
    };
  }));
  
  return trends;
}

async function generateInsights(payload: any) {
  console.log('Generating insights:', payload);
  
  const analytics = await processAnalytics({ metrics: ['imports', 'quality', 'sources', 'trends'] });
  const analyticsData = JSON.parse(analytics.body).analytics;
  
  const insights = [];
  
  // Import insights
  if (analyticsData.imports.success_rate > 95) {
    insights.push({
      type: 'success',
      title: 'Excellent Import Success Rate',
      description: `Your import success rate of ${analyticsData.imports.success_rate}% is excellent!`,
      priority: 'low'
    });
  } else if (analyticsData.imports.success_rate < 80) {
    insights.push({
      type: 'warning',
      title: 'Low Import Success Rate',
      description: `Your import success rate of ${analyticsData.imports.success_rate}% needs attention.`,
      priority: 'high'
    });
  }
  
  // Quality insights
  if (analyticsData.quality.profile_completeness < 70) {
    insights.push({
      type: 'improvement',
      title: 'Profile Completeness Opportunity',
      description: `Only ${analyticsData.quality.profile_completeness}% of profiles are complete. Consider profile enrichment.`,
      priority: 'medium'
    });
  }
  
  return new Response(
    JSON.stringify({ success: true, insights }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateMetrics(payload: any) {
  const { metric_type } = payload;
  
  let result = {};
  
  switch (metric_type) {
    case 'performance':
      result = await calculatePerformanceMetrics();
      break;
    case 'engagement':
      result = await calculateEngagementMetrics();
      break;
    case 'growth':
      result = await calculateGrowthMetrics();
      break;
    default:
      result = await processAnalytics({ metrics: ['imports', 'quality'] });
  }
  
  return new Response(
    JSON.stringify({ success: true, metrics: result }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculatePerformanceMetrics() {
  const { data: jobs } = await supabase
    .from('linkedin_import_jobs')
    .select('created_at, processed_at, status')
    .not('processed_at', 'is', null)
    .limit(100);
  
  if (!jobs || jobs.length === 0) {
    return { avg_processing_time: 0, throughput: 0, error_rate: 0 };
  }
  
  const processingTimes = jobs.map(job => {
    const start = new Date(job.created_at).getTime();
    const end = new Date(job.processed_at).getTime();
    return (end - start) / 1000; // seconds
  });
  
  const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
  const errorRate = (jobs.filter(job => job.status === 'failed').length / jobs.length) * 100;
  
  return {
    avg_processing_time: Math.round(avgTime),
    throughput: Math.round(3600 / avgTime), // jobs per hour
    error_rate: Math.round(errorRate * 100) / 100
  };
}

async function calculateEngagementMetrics() {
  // Simulate engagement metrics
  return {
    profile_views: Math.floor(Math.random() * 1000) + 500,
    connection_requests: Math.floor(Math.random() * 100) + 50,
    message_responses: Math.floor(Math.random() * 50) + 25
  };
}

async function calculateGrowthMetrics() {
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [
    { count: weeklyImports },
    { count: monthlyImports },
    { count: totalImports }
  ] = await Promise.all([
    supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeek.toISOString()),
    supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString()),
    supabase.from('linkedin_import_jobs').select('*', { count: 'exact', head: true })
  ]);
  
  return {
    weekly_growth: weeklyImports || 0,
    monthly_growth: monthlyImports || 0,
    total_imports: totalImports || 0,
    growth_rate: monthlyImports > 0 ? Math.round(((weeklyImports * 4) / monthlyImports - 1) * 100) : 0
  };
}

async function updateTrends(payload: any) {
  const trends = await calculateTrendMetrics(payload.date_range || '7d');
  
  await supabase
    .from('linkedin_analytics')
    .upsert({
      analytics_date: new Date().toISOString().split('T')[0],
      metrics_data: { trends },
      processed_at: new Date().toISOString()
    });
  
  return new Response(
    JSON.stringify({ success: true, trends }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}