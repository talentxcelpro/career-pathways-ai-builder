import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, siteUrl, dateRange = '30d', accessToken } = await req.json();
    
    console.log(`Google Search Console API request: ${action} for ${siteUrl}`);

    switch (action) {
      case 'authenticate':
        return handleAuthentication();
      
      case 'get_data':
        if (!accessToken) {
          throw new Error('Access token required for data retrieval');
        }
        return await getSearchConsoleData(siteUrl, dateRange, accessToken);
      
      case 'get_sites':
        if (!accessToken) {
          throw new Error('Access token required for sites retrieval');
        }
        return await getUserSites(accessToken);
      
      default:
        // Fallback: generate realistic demo data
        return generateDemoData(siteUrl, dateRange);
    }
  } catch (error) {
    console.error('Google Search Console error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackData: generateDemoData('demo-site.com', '30d')
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function handleAuthentication() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/google-search-console')}&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/webmasters.readonly')}&` +
    `response_type=code&` +
    `access_type=offline`;

  return new Response(JSON.stringify({ 
    authUrl,
    message: 'Use this URL to authenticate with Google Search Console'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getSearchConsoleData(siteUrl: string, dateRange: string, accessToken: string) {
  const endDate = new Date();
  const startDate = new Date();
  
  // Calculate date range
  const days = parseInt(dateRange.replace('d', '')) || 30;
  startDate.setDate(endDate.getDate() - days);

  const requestBody = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dimensions: ['query', 'page'],
    rowLimit: 100
  };

  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Process and structure the data
  const processedData = {
    summary: {
      totalClicks: data.rows?.reduce((sum: number, row: any) => sum + row.clicks, 0) || 0,
      totalImpressions: data.rows?.reduce((sum: number, row: any) => sum + row.impressions, 0) || 0,
      averageCTR: data.rows?.length ? 
        (data.rows.reduce((sum: number, row: any) => sum + row.ctr, 0) / data.rows.length * 100).toFixed(2) : 0,
      averagePosition: data.rows?.length ?
        (data.rows.reduce((sum: number, row: any) => sum + row.position, 0) / data.rows.length).toFixed(1) : 0
    },
    topQueries: data.rows?.slice(0, 20).map((row: any) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: (row.ctr * 100).toFixed(2),
      position: row.position.toFixed(1)
    })) || [],
    topPages: data.rows?.slice(0, 20).map((row: any) => ({
      page: row.keys[1] || row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: (row.ctr * 100).toFixed(2),
      position: row.position.toFixed(1)
    })) || []
  };

  return new Response(JSON.stringify(processedData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getUserSites(accessToken: string) {
  const response = await fetch(
    'https://www.googleapis.com/webmasters/v3/sites',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json();
  
  return new Response(JSON.stringify({
    sites: data.siteEntry?.map((site: any) => ({
      siteUrl: site.siteUrl,
      permissionLevel: site.permissionLevel
    })) || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateDemoData(siteUrl: string, dateRange: string) {
  const demoQueries = [
    'jobs in bangalore', 'software engineer careers', 'remote work opportunities',
    'data scientist jobs', 'product manager roles', 'frontend developer jobs',
    'ai engineer positions', 'startup careers', 'tech jobs india', 'work from home'
  ];

  const demoPages = [
    '/jobs/software-engineer', '/jobs/data-scientist', '/jobs/product-manager',
    '/jobs/frontend-developer', '/companies/startup', '/remote-jobs',
    '/career-advice', '/resume-builder', '/jobs/bangalore', '/jobs/mumbai'
  ];

  const processedData = {
    summary: {
      totalClicks: Math.floor(Math.random() * 5000) + 1000,
      totalImpressions: Math.floor(Math.random() * 50000) + 10000,
      averageCTR: (Math.random() * 5 + 2).toFixed(2),
      averagePosition: (Math.random() * 20 + 5).toFixed(1)
    },
    topQueries: demoQueries.map(query => ({
      query,
      clicks: Math.floor(Math.random() * 500) + 50,
      impressions: Math.floor(Math.random() * 5000) + 500,
      ctr: (Math.random() * 8 + 1).toFixed(2),
      position: (Math.random() * 15 + 3).toFixed(1)
    })),
    topPages: demoPages.map(page => ({
      page,
      clicks: Math.floor(Math.random() * 300) + 30,
      impressions: Math.floor(Math.random() * 3000) + 300,
      ctr: (Math.random() * 6 + 2).toFixed(2),
      position: (Math.random() * 12 + 4).toFixed(1)
    }))
  };

  return new Response(JSON.stringify(processedData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}