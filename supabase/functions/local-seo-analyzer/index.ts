import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocalSEOData {
  businessName: string;
  location: string;
  localRankings: Array<{
    keyword: string;
    localPosition: number;
    organicPosition: number;
    localSearchVolume: number;
    city: string;
  }>;
  googleMyBusiness: {
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    photos: number;
    posts: number;
    lastUpdate: string;
  };
  localCitations: Array<{
    source: string;
    status: 'consistent' | 'inconsistent' | 'missing';
    url: string;
    authority: number;
  }>;
  localCompetitors: Array<{
    name: string;
    rating: number;
    reviewCount: number;
    averagePosition: number;
    distance: string;
  }>;
  nap: {
    name: string;
    address: string;
    phone: string;
    consistency: number;
  };
  localSchema: {
    hasSchema: boolean;
    type: string;
    completeness: number;
  };
}

async function analyzeLocalSEO(domain: string, location: string, businessName: string): Promise<LocalSEOData> {
  try {
    // Generate local rankings data
    const localKeywords = [
      `${businessName.toLowerCase()} ${location.toLowerCase()}`,
      `job search ${location.toLowerCase()}`,
      `career services ${location.toLowerCase()}`,
      `resume writing ${location.toLowerCase()}`,
      `employment agency ${location.toLowerCase()}`,
      `recruitment ${location.toLowerCase()}`,
      `job placement ${location.toLowerCase()}`,
      `career counseling ${location.toLowerCase()}`
    ];
    
    const localRankings = localKeywords.map(keyword => ({
      keyword,
      localPosition: Math.floor(Math.random() * 20) + 1,
      organicPosition: Math.floor(Math.random() * 50) + 10,
      localSearchVolume: Math.floor(Math.random() * 1000) + 100,
      city: location
    }));
    
    // Generate Google My Business data
    const googleMyBusiness = {
      isVerified: Math.random() > 0.2,
      rating: 3.5 + Math.random() * 1.5, // 3.5-5.0
      reviewCount: Math.floor(Math.random() * 500) + 50,
      photos: Math.floor(Math.random() * 100) + 20,
      posts: Math.floor(Math.random() * 20) + 5,
      lastUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    // Generate local citations
    const citationSources = [
      'Yellow Pages', 'Yelp', 'Google My Business', 'Bing Places',
      'Facebook', 'Apple Maps', 'LinkedIn', 'Better Business Bureau',
      'Chamber of Commerce', 'Industry Directory'
    ];
    
    const localCitations = citationSources.map(source => ({
      source,
      status: Math.random() > 0.7 ? 'inconsistent' : 
              Math.random() > 0.1 ? 'consistent' : 'missing',
      url: `https://${source.toLowerCase().replace(/\s+/g, '')}.com/business/${businessName.toLowerCase().replace(/\s+/g, '-')}`,
      authority: Math.floor(Math.random() * 40) + 60
    }));
    
    // Generate local competitors
    const localCompetitors = [
      'Local Career Services', 'Metro Job Center', 'Professional Recruitment',
      'City Employment Agency', 'Regional Talent Solutions'
    ].map(name => ({
      name,
      rating: 3.0 + Math.random() * 2.0,
      reviewCount: Math.floor(Math.random() * 300) + 25,
      averagePosition: Math.floor(Math.random() * 15) + 5,
      distance: `${(Math.random() * 5).toFixed(1)} miles`
    }));
    
    // Generate NAP consistency data
    const nap = {
      name: businessName,
      address: `123 Business St, ${location}`,
      phone: '+1 (555) 123-4567',
      consistency: Math.floor(Math.random() * 30) + 70 // 70-100%
    };
    
    // Generate local schema data
    const localSchema = {
      hasSchema: Math.random() > 0.3,
      type: 'LocalBusiness',
      completeness: Math.floor(Math.random() * 40) + 60 // 60-100%
    };
    
    return {
      businessName,
      location,
      localRankings,
      googleMyBusiness,
      localCitations: localCitations as any,
      localCompetitors,
      nap,
      localSchema
    };
    
  } catch (error) {
    console.error('Error analyzing local SEO:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, location, businessName } = await req.json();
    
    if (!domain || !location || !businessName) {
      return new Response(
        JSON.stringify({ error: 'Domain, location, and business name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting local SEO analysis for ${businessName} in ${location}`);
    
    const result = await analyzeLocalSEO(domain, location, businessName);
    
    console.log(`Local SEO analysis completed. NAP consistency: ${result.nap.consistency}%`);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in local SEO analysis function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});