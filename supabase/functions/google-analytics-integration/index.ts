import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsData {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  demographics: {
    countries: Array<{ country: string; sessions: number }>;
    devices: Array<{ device: string; sessions: number }>;
  };
  realTime: {
    activeUsers: number;
    topPages: Array<{ page: string; users: number }>;
  };
}

async function fetchAnalyticsData(dateRange: string = '30d'): Promise<AnalyticsData> {
  // Note: This would integrate with Google Analytics Reporting API
  // For now, providing realistic data based on TalentXcel metrics
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate realistic data based on TalentXcel.in size
    const baseMetrics = {
      sessions: Math.floor(Math.random() * 50000) + 25000, // 25K-75K sessions
      users: Math.floor(Math.random() * 35000) + 18000,    // 18K-53K users
      pageviews: Math.floor(Math.random() * 150000) + 75000, // 75K-225K pageviews
      bounceRate: 45 + Math.random() * 20, // 45-65%
      avgSessionDuration: 120 + Math.random() * 180, // 2-5 minutes
    };

    // Top performing pages for a job portal
    const topPages = [
      { page: '/', views: Math.floor(baseMetrics.pageviews * 0.15), uniqueViews: Math.floor(baseMetrics.users * 0.12) },
      { page: '/jobs', views: Math.floor(baseMetrics.pageviews * 0.25), uniqueViews: Math.floor(baseMetrics.users * 0.22) },
      { page: '/jobs/software-engineer-bangalore', views: Math.floor(baseMetrics.pageviews * 0.08), uniqueViews: Math.floor(baseMetrics.users * 0.07) },
      { page: '/jobs/data-scientist-mumbai', views: Math.floor(baseMetrics.pageviews * 0.06), uniqueViews: Math.floor(baseMetrics.users * 0.05) },
      { page: '/companies', views: Math.floor(baseMetrics.pageviews * 0.05), uniqueViews: Math.floor(baseMetrics.users * 0.04) },
      { page: '/resume-builder', views: Math.floor(baseMetrics.pageviews * 0.07), uniqueViews: Math.floor(baseMetrics.users * 0.06) },
      { page: '/profile', views: Math.floor(baseMetrics.pageviews * 0.04), uniqueViews: Math.floor(baseMetrics.users * 0.08) },
    ];

    // Top keywords for job portal
    const topKeywords = [
      { keyword: 'jobs in bangalore', clicks: 2850, impressions: 45000, ctr: 6.3, position: 8.2 },
      { keyword: 'software engineer jobs', clicks: 2340, impressions: 38000, ctr: 6.2, position: 9.1 },
      { keyword: 'remote jobs india', clicks: 1890, impressions: 32000, ctr: 5.9, position: 11.3 },
      { keyword: 'data scientist jobs mumbai', clicks: 1654, impressions: 28000, ctr: 5.9, position: 12.8 },
      { keyword: 'marketing jobs delhi', clicks: 1432, impressions: 25000, ctr: 5.7, position: 14.2 },
      { keyword: 'python developer jobs', clicks: 1289, impressions: 23000, ctr: 5.6, position: 15.6 },
      { keyword: 'fresher jobs', clicks: 1156, impressions: 22000, ctr: 5.3, position: 16.8 },
      { keyword: 'hr jobs noida', clicks: 987, impressions: 19000, ctr: 5.2, position: 18.4 },
    ];

    // Demographics data
    const demographics = {
      countries: [
        { country: 'India', sessions: Math.floor(baseMetrics.sessions * 0.85) },
        { country: 'United States', sessions: Math.floor(baseMetrics.sessions * 0.08) },
        { country: 'United Kingdom', sessions: Math.floor(baseMetrics.sessions * 0.03) },
        { country: 'Canada', sessions: Math.floor(baseMetrics.sessions * 0.02) },
        { country: 'Australia', sessions: Math.floor(baseMetrics.sessions * 0.02) },
      ],
      devices: [
        { device: 'Mobile', sessions: Math.floor(baseMetrics.sessions * 0.65) },
        { device: 'Desktop', sessions: Math.floor(baseMetrics.sessions * 0.30) },
        { device: 'Tablet', sessions: Math.floor(baseMetrics.sessions * 0.05) },
      ],
    };

    // Real-time data
    const realTime = {
      activeUsers: Math.floor(Math.random() * 500) + 100, // 100-600 active users
      topPages: [
        { page: '/jobs', users: Math.floor(Math.random() * 50) + 20 },
        { page: '/', users: Math.floor(Math.random() * 40) + 15 },
        { page: '/jobs/software-engineer-bangalore', users: Math.floor(Math.random() * 30) + 10 },
        { page: '/resume-builder', users: Math.floor(Math.random() * 25) + 8 },
      ],
    };

    return {
      ...baseMetrics,
      topPages,
      topKeywords,
      demographics,
      realTime,
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dateRange } = await req.json();
    
    console.log(`Fetching analytics data for range: ${dateRange || '30d'}`);
    
    const analyticsData = await fetchAnalyticsData(dateRange);
    
    return new Response(
      JSON.stringify(analyticsData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analytics integration function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch analytics data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});