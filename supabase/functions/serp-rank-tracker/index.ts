import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RankingResult {
  keyword: string;
  domain: string;
  position: number | null;
  url: string | null;
  title: string | null;
  snippet: string | null;
  searchVolume: number | null;
  difficulty: number | null;
  cpc: number | null;
  competition: string | null;
  trends: Array<{ month: string; volume: number }>;
}

interface SerpApiResponse {
  organic_results?: Array<{
    position: number;
    link: string;
    title: string;
    snippet: string;
  }>;
  search_metadata?: {
    total_results: number;
  };
  search_parameters?: {
    q: string;
  };
}

async function checkKeywordRanking(keyword: string, domain: string): Promise<RankingResult> {
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  
  if (!serpApiKey) {
    throw new Error('SerpAPI key not configured');
  }

  try {
    // Search for the keyword using SerpAPI
    const searchUrl = new URL('https://serpapi.com/search');
    searchUrl.searchParams.set('engine', 'google');
    searchUrl.searchParams.set('q', keyword);
    searchUrl.searchParams.set('api_key', serpApiKey);
    searchUrl.searchParams.set('num', '100'); // Check top 100 results
    searchUrl.searchParams.set('gl', 'in'); // India
    searchUrl.searchParams.set('hl', 'en'); // English

    console.log(`Searching for keyword: ${keyword}, domain: ${domain}`);
    
    const response = await fetch(searchUrl.toString());
    const data: SerpApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    // Find the domain in organic results
    let position = null;
    let foundUrl = null;
    let title = null;
    let snippet = null;

    if (data.organic_results) {
      for (const result of data.organic_results) {
        try {
          const resultDomain = new URL(result.link).hostname.replace('www.', '');
          const targetDomain = domain.replace('www.', '').replace(/^https?:\/\//, '');
          
          if (resultDomain === targetDomain) {
            position = result.position;
            foundUrl = result.link;
            title = result.title;
            snippet = result.snippet;
            break;
          }
        } catch (e) {
          console.warn(`Invalid URL in SERP result: ${result.link}`);
        }
      }
    }

    // Generate mock data for additional metrics (in real implementation, these would come from additional APIs)
    const searchVolume = Math.floor(Math.random() * 10000) + 100;
    const difficulty = Math.floor(Math.random() * 100);
    const cpc = Math.random() * 5;
    const competition = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
    
    // Generate trend data (mock)
    const trends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const volume = Math.floor(searchVolume * (0.8 + Math.random() * 0.4));
      trends.push({ month: monthName, volume });
    }

    return {
      keyword,
      domain,
      position,
      url: foundUrl,
      title,
      snippet,
      searchVolume,
      difficulty,
      cpc,
      competition,
      trends
    };

  } catch (error) {
    console.error(`Error checking ranking for ${keyword}:`, error);
    
    return {
      keyword,
      domain,
      position: null,
      url: null,
      title: null,
      snippet: null,
      searchVolume: null,
      difficulty: null,
      cpc: null,
      competition: null,
      trends: []
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, domain } = await req.json();
    
    if (!keywords || !domain) {
      return new Response(
        JSON.stringify({ error: 'Keywords array and domain are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ error: 'Keywords must be an array' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting rank tracking for ${keywords.length} keywords on domain: ${domain}`);
    
    // Process keywords in parallel (but limit to avoid rate limits)
    const batchSize = 3;
    const results = [];
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      const batchPromises = batch.map(keyword => checkKeywordRanking(keyword, domain));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Rank tracking completed. Found ${results.filter(r => r.position).length} ranked keywords out of ${keywords.length}`);
    
    return new Response(
      JSON.stringify({ results }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in rank tracking function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});