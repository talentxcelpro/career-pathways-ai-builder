import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompetitorData {
  domain: string;
  domainAuthority: number;
  organicKeywords: number;
  organicTraffic: number;
  topKeywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    difficulty: number;
    url: string;
  }>;
  contentGaps: Array<{
    keyword: string;
    competitorPosition: number;
    yourPosition: number | null;
    opportunity: 'high' | 'medium' | 'low';
    volume: number;
    difficulty: number;
  }>;
  contentTopics: Array<{
    topic: string;
    pageCount: number;
    avgPosition: number;
    totalTraffic: number;
  }>;
  socialPresence: {
    facebook: number;
    twitter: number;
    linkedin: number;
    instagram: number;
  };
}

interface CompetitorAnalysisResult {
  yourDomain: string;
  competitors: CompetitorData[];
  overallInsights: {
    avgCompetitorDA: number;
    totalGapKeywords: number;
    topOpportunities: string[];
    contentGapScore: number;
  };
}

async function analyzeCompetitors(domain: string, competitors: string[]): Promise<CompetitorAnalysisResult> {
  try {
    const competitorData: CompetitorData[] = [];
    
    for (const competitor of competitors) {
      // Generate realistic mock data for each competitor
      const baseDA = Math.floor(Math.random() * 40) + 40; // 40-80 DA
      const organicKeywords = Math.floor(Math.random() * 50000) + 10000;
      const organicTraffic = Math.floor(Math.random() * 500000) + 50000;
      
      // Generate top keywords for competitor
      const topKeywords = [
        'ai resume builder', 'job search platform', 'career guidance', 'resume templates',
        'job matching', 'career coaching', 'professional networking', 'skill assessment',
        'interview preparation', 'salary calculator', 'career development', 'job alerts',
        'remote work', 'freelance jobs', 'executive search', 'talent acquisition'
      ].slice(0, 10).map(keyword => ({
        keyword,
        position: Math.floor(Math.random() * 20) + 1,
        volume: Math.floor(Math.random() * 10000) + 1000,
        difficulty: Math.floor(Math.random() * 80) + 20,
        url: `https://${competitor}/${keyword.replace(/\s+/g, '-')}`
      }));
      
      // Generate content gaps (keywords competitor ranks for but you don't)
      const contentGaps = [
        'professional resume writing', 'career transition guide', 'job interview tips',
        'linkedin optimization', 'salary negotiation', 'remote work best practices',
        'career change advice', 'job search strategies', 'networking tips',
        'performance review tips'
      ].slice(0, 8).map(keyword => {
        const competitorPos = Math.floor(Math.random() * 15) + 1;
        const yourPos = Math.random() > 0.3 ? null : Math.floor(Math.random() * 50) + 20;
        return {
          keyword,
          competitorPosition: competitorPos,
          yourPosition: yourPos,
          opportunity: (competitorPos <= 5 && !yourPos) ? 'high' : 
                      (competitorPos <= 10 && !yourPos) ? 'medium' : 'low',
          volume: Math.floor(Math.random() * 8000) + 500,
          difficulty: Math.floor(Math.random() * 60) + 20
        };
      });
      
      // Generate content topics
      const contentTopics = [
        'Resume Building', 'Career Advice', 'Job Search', 'Interview Tips',
        'Salary Guides', 'Industry Insights', 'Skill Development', 'Networking'
      ].map(topic => ({
        topic,
        pageCount: Math.floor(Math.random() * 50) + 5,
        avgPosition: Math.floor(Math.random() * 20) + 5,
        totalTraffic: Math.floor(Math.random() * 20000) + 1000
      }));
      
      // Generate social presence
      const socialPresence = {
        facebook: Math.floor(Math.random() * 100000) + 5000,
        twitter: Math.floor(Math.random() * 50000) + 2000,
        linkedin: Math.floor(Math.random() * 200000) + 10000,
        instagram: Math.floor(Math.random() * 30000) + 1000
      };
      
      competitorData.push({
        domain: competitor,
        domainAuthority: baseDA,
        organicKeywords,
        organicTraffic,
        topKeywords,
        contentGaps: contentGaps as any,
        contentTopics,
        socialPresence
      });
    }
    
    // Calculate overall insights
    const avgCompetitorDA = Math.round(
      competitorData.reduce((sum, comp) => sum + comp.domainAuthority, 0) / competitorData.length
    );
    
    const allGaps = competitorData.flatMap(comp => comp.contentGaps);
    const totalGapKeywords = allGaps.filter(gap => gap.opportunity === 'high').length;
    
    const topOpportunities = allGaps
      .filter(gap => gap.opportunity === 'high')
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5)
      .map(gap => gap.keyword);
    
    const contentGapScore = Math.min(100, (totalGapKeywords / allGaps.length) * 100);
    
    return {
      yourDomain: domain,
      competitors: competitorData,
      overallInsights: {
        avgCompetitorDA,
        totalGapKeywords,
        topOpportunities,
        contentGapScore
      }
    };
    
  } catch (error) {
    console.error('Error analyzing competitors:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, competitors } = await req.json();
    
    if (!domain || !competitors) {
      return new Response(
        JSON.stringify({ error: 'Domain and competitors array are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!Array.isArray(competitors) || competitors.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one competitor domain is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting competitor analysis for ${domain} vs ${competitors.join(', ')}`);
    
    const result = await analyzeCompetitors(domain, competitors);
    
    console.log(`Competitor analysis completed. Found ${result.overallInsights.totalGapKeywords} high-opportunity gaps`);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in competitor analysis function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});