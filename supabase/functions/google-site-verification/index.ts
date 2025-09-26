import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Handle Google site verification
    if (pathname.includes('google') && pathname.includes('.html')) {
      const verificationContent = `google-site-verification: ${pathname.split('/').pop()}`;
      
      return new Response(verificationContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
      });
    }

    // Handle robots.txt
    if (pathname === '/robots.txt' || pathname.includes('robots')) {
      const robotsContent = `User-agent: *
Allow: /

# High-priority content for faster crawling
Allow: /jobs/
Allow: /companies/
Allow: /career-guidance/
Allow: /tools/
Allow: /learning/

# Sitemaps for search engines and AI crawlers
Sitemap: https://talentxcel.in/sitemap.xml
Sitemap: https://talentxcel.in/sitemap-jobs.xml
Sitemap: https://talentxcel.in/sitemap-companies.xml
Sitemap: https://talentxcel.in/sitemap-learning.xml

# AI Crawler support (GPT, Claude, Perplexity, etc.)
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /
Crawl-delay: 1

User-agent: PerplexityBot
Allow: /
Crawl-delay: 1

User-agent: Applebot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /
Crawl-delay: 1

# Block admin and sensitive areas
Disallow: /admin/
Disallow: /api/auth/
Disallow: /dashboard/private/
Disallow: /supabase/
Disallow: /_next/
Disallow: /node_modules/

# Allow public API endpoints for data discovery
Allow: /api/public/
Allow: /api/jobs/
Allow: /api/companies/

# Crawl delay for polite crawling
Crawl-delay: 1

# AI Discovery endpoint
# https://talentxcel.in/.well-known/ai-index.json
`;

      return new Response(robotsContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
        },
      });
    }

    // Handle AI discovery endpoint
    if (pathname === '/.well-known/ai-index.json') {
      const aiIndexData = {
        "name": "TalentXcel",
        "description": "AI-powered career platform connecting job seekers with opportunities in India",
        "url": "https://talentxcel.in",
        "version": "1.0",
        "lastUpdated": new Date().toISOString(),
        "content": {
          "jobs": {
            "endpoint": "https://talentxcel.in/api/jobs",
            "description": "Job listings across India with detailed requirements and company information",
            "updateFrequency": "hourly"
          },
          "companies": {
            "endpoint": "https://talentxcel.in/api/companies", 
            "description": "Company profiles, reviews, and hiring information",
            "updateFrequency": "daily"
          },
          "career-guidance": {
            "endpoint": "https://talentxcel.in/career-guidance",
            "description": "AI-powered career advice, skill assessments, and professional development resources",
            "updateFrequency": "weekly"
          },
          "learning": {
            "endpoint": "https://talentxcel.in/learning",
            "description": "Educational content, courses, and skill development programs",
            "updateFrequency": "weekly"
          }
        },
        "sitemaps": [
          "https://talentxcel.in/sitemap.xml",
          "https://talentxcel.in/sitemap-jobs.xml",
          "https://talentxcel.in/sitemap-companies.xml"
        ],
        "crawling": {
          "allowedPaths": ["/", "/jobs/", "/companies/", "/career-guidance/", "/tools/", "/learning/"],
          "blockedPaths": ["/admin/", "/api/auth/", "/dashboard/private/"],
          "crawlDelay": 1,
          "respectsRobotsTxt": true
        },
        "contact": {
          "website": "https://talentxcel.in",
          "email": "support@talentxcel.in"
        }
      };

      return new Response(JSON.stringify(aiIndexData, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        message: 'SEO utilities endpoint',
        available_endpoints: [
          '/robots.txt',
          '/.well-known/ai-index.json',
          '/google[verification-code].html'
        ]
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in google-site-verification function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});