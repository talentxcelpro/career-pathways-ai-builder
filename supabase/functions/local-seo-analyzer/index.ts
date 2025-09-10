import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocalSEOAnalysis {
  city: string;
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    opportunity: number;
    currentRanking?: number;
    competitorRankings: Array<{
      domain: string;
      position: number;
      title: string;
    }>;
  }>;
  marketInsights: {
    totalJobSearches: number;
    topIndustries: Array<{ industry: string; percentage: number }>;
    averageSalaries: Array<{ role: string; salary: string }>;
    jobGrowth: number;
  };
  competitorAnalysis: Array<{
    domain: string;
    overallScore: number;
    localPresence: number;
    contentQuality: number;
    backlinks: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    impact: string;
    effort: string;
  }>;
}

// Indian cities with job market data
const INDIAN_CITIES_DATA = {
  'bangalore': {
    totalJobSearches: 2500000,
    topIndustries: [
      { industry: 'Information Technology', percentage: 45 },
      { industry: 'Biotechnology', percentage: 15 },
      { industry: 'Aerospace', percentage: 12 },
      { industry: 'Financial Services', percentage: 10 },
      { industry: 'Healthcare', percentage: 8 },
    ],
    averageSalaries: [
      { role: 'Software Engineer', salary: '₹8-15 LPA' },
      { role: 'Data Scientist', salary: '₹12-25 LPA' },
      { role: 'Product Manager', salary: '₹15-30 LPA' },
      { role: 'Marketing Manager', salary: '₹8-18 LPA' },
    ],
    jobGrowth: 18.5,
  },
  'mumbai': {
    totalJobSearches: 2200000,
    topIndustries: [
      { industry: 'Financial Services', percentage: 35 },
      { industry: 'Entertainment & Media', percentage: 20 },
      { industry: 'Information Technology', percentage: 18 },
      { industry: 'Pharmaceutical', percentage: 12 },
      { industry: 'Textiles', percentage: 8 },
    ],
    averageSalaries: [
      { role: 'Financial Analyst', salary: '₹6-12 LPA' },
      { role: 'Software Engineer', salary: '₹7-14 LPA' },
      { role: 'Sales Manager', salary: '₹8-20 LPA' },
      { role: 'HR Manager', salary: '₹6-15 LPA' },
    ],
    jobGrowth: 15.2,
  },
  'delhi': {
    totalJobSearches: 2000000,
    topIndustries: [
      { industry: 'Government', percentage: 25 },
      { industry: 'Information Technology', percentage: 20 },
      { industry: 'Education', percentage: 15 },
      { industry: 'Healthcare', percentage: 12 },
      { industry: 'Tourism', percentage: 10 },
    ],
    averageSalaries: [
      { role: 'Government Officer', salary: '₹5-12 LPA' },
      { role: 'Software Engineer', salary: '₹7-15 LPA' },
      { role: 'Teacher', salary: '₹3-8 LPA' },
      { role: 'Marketing Executive', salary: '₹4-10 LPA' },
    ],
    jobGrowth: 12.8,
  },
  'hyderabad': {
    totalJobSearches: 1800000,
    topIndustries: [
      { industry: 'Information Technology', percentage: 40 },
      { industry: 'Pharmaceutical', percentage: 20 },
      { industry: 'Biotechnology', percentage: 15 },
      { industry: 'Aerospace', percentage: 10 },
      { industry: 'Financial Services', percentage: 8 },
    ],
    averageSalaries: [
      { role: 'Software Engineer', salary: '₹6-12 LPA' },
      { role: 'Research Scientist', salary: '₹8-18 LPA' },
      { role: 'Data Analyst', salary: '₹5-10 LPA' },
      { role: 'Project Manager', salary: '₹10-20 LPA' },
    ],
    jobGrowth: 20.3,
  },
  'chennai': {
    totalJobSearches: 1600000,
    topIndustries: [
      { industry: 'Automotive', percentage: 30 },
      { industry: 'Information Technology', percentage: 25 },
      { industry: 'Healthcare', percentage: 15 },
      { industry: 'Leather & Textiles', percentage: 12 },
      { industry: 'Port & Shipping', percentage: 8 },
    ],
    averageSalaries: [
      { role: 'Automotive Engineer', salary: '₹5-12 LPA' },
      { role: 'Software Engineer', salary: '₹6-13 LPA' },
      { role: 'Manufacturing Manager', salary: '₹8-18 LPA' },
      { role: 'Quality Analyst', salary: '₹4-9 LPA' },
    ],
    jobGrowth: 14.7,
  },
  'pune': {
    totalJobSearches: 1400000,
    topIndustries: [
      { industry: 'Information Technology', percentage: 35 },
      { industry: 'Automotive', percentage: 25 },
      { industry: 'Manufacturing', percentage: 15 },
      { industry: 'Education', percentage: 10 },
      { industry: 'Agriculture Tech', percentage: 8 },
    ],
    averageSalaries: [
      { role: 'Software Engineer', salary: '₹6-12 LPA' },
      { role: 'Mechanical Engineer', salary: '₹4-10 LPA' },
      { role: 'Business Analyst', salary: '₹5-12 LPA' },
      { role: 'Operations Manager', salary: '₹7-15 LPA' },
    ],
    jobGrowth: 16.8,
  },
  'noida': {
    totalJobSearches: 1200000,
    topIndustries: [
      { industry: 'Information Technology', percentage: 45 },
      { industry: 'Media & Advertising', percentage: 20 },
      { industry: 'Manufacturing', percentage: 15 },
      { industry: 'E-commerce', percentage: 10 },
      { industry: 'Financial Services', percentage: 8 },
    ],
    averageSalaries: [
      { role: 'Software Engineer', salary: '₹6-14 LPA' },
      { role: 'Digital Marketing Manager', salary: '₹5-12 LPA' },
      { role: 'Content Writer', salary: '₹3-7 LPA' },
      { role: 'Sales Executive', salary: '₹4-8 LPA' },
    ],
    jobGrowth: 19.2,
  },
  'gurgaon': {
    totalJobSearches: 1300000,
    topIndustries: [
      { industry: 'Financial Services', percentage: 30 },
      { industry: 'Information Technology', percentage: 25 },
      { industry: 'Automotive', percentage: 15 },
      { industry: 'Real Estate', percentage: 12 },
      { industry: 'Retail', percentage: 10 },
    ],
    averageSalaries: [
      { role: 'Financial Analyst', salary: '₹7-15 LPA' },
      { role: 'Software Engineer', salary: '₹7-15 LPA' },
      { role: 'Sales Manager', salary: '₹8-18 LPA' },
      { role: 'HR Business Partner', salary: '₹6-14 LPA' },
    ],
    jobGrowth: 17.5,
  },
};

async function analyzeLocalSEO(city: string): Promise<LocalSEOAnalysis> {
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  const cityLower = city.toLowerCase();
  const cityData = INDIAN_CITIES_DATA[cityLower] || INDIAN_CITIES_DATA['bangalore'];

  console.log(`Analyzing local SEO for: ${city}`);

  try {
    // Generate city-specific keywords
    const keywords = [
      {
        keyword: `jobs in ${city}`,
        searchVolume: Math.floor(cityData.totalJobSearches * 0.15),
        difficulty: 65,
        opportunity: 85,
        currentRanking: Math.floor(Math.random() * 20) + 8,
        competitorRankings: [
          { domain: 'naukri.com', position: 1, title: `Jobs in ${city} - Latest Job Vacancies` },
          { domain: 'indeed.co.in', position: 2, title: `${city} Jobs - Apply Now` },
          { domain: 'monster.com', position: 3, title: `Job Openings in ${city}` },
          { domain: 'linkedin.com', position: 4, title: `${city} Jobs - LinkedIn` },
        ]
      },
      {
        keyword: `software engineer jobs ${city}`,
        searchVolume: Math.floor(cityData.totalJobSearches * 0.08),
        difficulty: 72,
        opportunity: 78,
        currentRanking: Math.floor(Math.random() * 15) + 5,
        competitorRankings: [
          { domain: 'naukri.com', position: 1, title: `Software Engineer Jobs in ${city}` },
          { domain: 'indeed.co.in', position: 2, title: `Software Developer Positions ${city}` },
          { domain: 'glassdoor.co.in', position: 3, title: `${city} Software Engineer Salaries` },
        ]
      },
      {
        keyword: `remote jobs ${city}`,
        searchVolume: Math.floor(cityData.totalJobSearches * 0.06),
        difficulty: 58,
        opportunity: 92,
        currentRanking: Math.floor(Math.random() * 25) + 10,
        competitorRankings: [
          { domain: 'naukri.com', position: 2, title: `Remote Jobs in ${city}` },
          { domain: 'flexjobs.com', position: 4, title: `Work from Home Jobs ${city}` },
          { domain: 'remote.co', position: 6, title: `Remote Opportunities ${city}` },
        ]
      },
      {
        keyword: `fresher jobs ${city}`,
        searchVolume: Math.floor(cityData.totalJobSearches * 0.12),
        difficulty: 55,
        opportunity: 88,
        currentRanking: Math.floor(Math.random() * 18) + 7,
        competitorRankings: [
          { domain: 'naukri.com', position: 1, title: `Fresher Jobs in ${city}` },
          { domain: 'freshersworld.com', position: 2, title: `Entry Level Jobs ${city}` },
          { domain: 'internshala.com', position: 3, title: `Graduate Jobs ${city}` },
        ]
      }
    ];

    // Competitor analysis
    const competitorAnalysis = [
      {
        domain: 'naukri.com',
        overallScore: 95,
        localPresence: 98,
        contentQuality: 85,
        backlinks: 850000,
        strengths: ['Market leader', 'Strong brand recognition', 'Comprehensive job listings'],
        weaknesses: ['Heavy UI', 'Limited personalization']
      },
      {
        domain: 'indeed.co.in',
        overallScore: 88,
        localPresence: 85,
        contentQuality: 90,
        backlinks: 420000,
        strengths: ['International brand', 'Good user experience', 'Company reviews'],
        weaknesses: ['Less local content', 'Limited Indian market focus']
      },
      {
        domain: 'monster.com',
        overallScore: 75,
        localPresence: 70,
        contentQuality: 80,
        backlinks: 280000,
        strengths: ['Established presence', 'Career advice content'],
        weaknesses: ['Declining market share', 'Outdated interface']
      },
      {
        domain: 'linkedin.com',
        overallScore: 92,
        localPresence: 75,
        contentQuality: 95,
        backlinks: 1200000,
        strengths: ['Professional network', 'High-quality candidates', 'Employer branding'],
        weaknesses: ['Premium features', 'Not job-focused primarily']
      }
    ];

    // Generate recommendations
    const recommendations = [
      {
        priority: 'high' as const,
        category: 'Local Content',
        action: `Create city-specific landing pages for top job categories in ${city}`,
        impact: 'High - improved local search visibility',
        effort: 'Medium - content creation required'
      },
      {
        priority: 'high' as const,
        category: 'Keyword Optimization',
        action: `Target long-tail keywords like "software engineer jobs ${city}" with dedicated pages`,
        impact: 'High - capture specific search intent',
        effort: 'Low - optimize existing content'
      },
      {
        priority: 'medium' as const,
        category: 'Local SEO',
        action: `Build location-specific backlinks from ${city} business directories and local websites`,
        impact: 'Medium - improved local authority',
        effort: 'High - outreach required'
      },
      {
        priority: 'medium' as const,
        category: 'Content Marketing',
        action: `Publish "${city} Job Market Report" and salary guides for top industries`,
        impact: 'Medium - thought leadership and backlinks',
        effort: 'Medium - research and writing'
      },
      {
        priority: 'low' as const,
        category: 'Technical SEO',
        action: 'Implement local business schema markup for job postings',
        impact: 'Low - enhanced rich snippets',
        effort: 'Low - technical implementation'
      }
    ];

    return {
      city,
      keywords,
      marketInsights: cityData,
      competitorAnalysis,
      recommendations,
    };

  } catch (error) {
    console.error('Error analyzing local SEO:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city } = await req.json();
    
    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Local SEO analysis requested for: ${city}`);
    
    const analysis = await analyzeLocalSEO(city);
    
    return new Response(
      JSON.stringify(analysis),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in local SEO analyzer:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze local SEO' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});