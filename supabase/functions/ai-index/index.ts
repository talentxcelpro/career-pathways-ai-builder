
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // AI Index endpoint for discovery
    if (url.pathname === '/.well-known/ai-index.json') {
      const aiIndex = {
        platform: "TalentXcel",
        version: "1.0",
        description: "AI-Powered Career Platform for job seekers, professionals, and employers",
        modules: [
          "Jobs",
          "Resume Builder", 
          "Learning",
          "Career Map",
          "Networking",
          "Companies",
          "Tools",
          "Services",
          "Colleges"
        ],
        ai_features: [
          "Job Match GPT",
          "Resume AI", 
          "Career Pathfinder",
          "Smart Apply",
          "Skill Assessment",
          "Interview Prep AI",
          "Salary Negotiation Assistant",
          "Learning Path Recommendations"
        ],
        content_types: [
          "job_postings",
          "company_profiles", 
          "user_profiles",
          "courses",
          "career_paths",
          "tools",
          "services",
          "colleges"
        ],
        api_endpoints: {
          "jobs": "https://talentxcel.in/api/jobs",
          "companies": "https://talentxcel.in/api/companies",
          "courses": "https://talentxcel.in/api/courses",
          "sitemap": "https://talentxcel.in/sitemap.xml"
        },
        crawl_info: {
          "robots_txt": "https://talentxcel.in/robots.txt",
          "sitemap_index": "https://talentxcel.in/sitemap-index.xml",
          "rss_feed": "https://talentxcel.in/rss-feed.xml"
        },
        contact: {
          "support_url": "https://talentxcel.in/help",
          "email": "support@talentxcel.in"
        },
        ai_training_policy: {
          "opt_out": false,
          "attribution_required": true,
          "commercial_use": "allowed_with_attribution"
        },
        last_updated: new Date().toISOString()
      };

      return new Response(JSON.stringify(aiIndex, null, 2), {
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=3600',
          'X-Robots-Tag': 'all'
        }
      });
    }

    // Platform metadata for AI crawlers
    if (url.pathname === '/api/ai-metadata') {
      const metadata = {
        platform_stats: {
          total_jobs: "50000+",
          total_companies: "5000+", 
          total_users: "100000+",
          total_courses: "1000+"
        },
        popular_searches: [
          "software engineer jobs",
          "data scientist positions",
          "product manager roles",
          "ui ux designer jobs",
          "DevOps engineer positions"
        ],
        trending_skills: [
          "JavaScript",
          "Python", 
          "React",
          "AWS",
          "Machine Learning",
          "Data Analysis"
        ],
        top_locations: [
          "Bangalore",
          "Mumbai",
          "Delhi",
          "Hyderabad",
          "Chennai",
          "Pune"
        ]
      };

      return new Response(JSON.stringify(metadata, null, 2), {
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=1800',
          'X-Robots-Tag': 'all'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('AI Index Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
})
