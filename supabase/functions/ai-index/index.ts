
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
    
    // Phase 4: Enhanced AI Index endpoint for discovery
    if (url.pathname === '/.well-known/ai-index.json') {
      const aiIndex = {
        platform: "TalentXcel",
        version: "2.0",
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
          "Learning Path Recommendations",
          "AI Career Insights",
          "Smart Interview Prep",
          "Personalized Learning Paths"
        ],
        content_types: [
          "job_postings",
          "company_profiles", 
          "user_profiles",
          "courses",
          "career_paths",
          "tools",
          "services",
          "colleges",
          "blog_posts",
          "career_insights"
        ],
        api_endpoints: {
          "jobs": "https://talentxcel.in/api/jobs",
          "companies": "https://talentxcel.in/api/companies",
          "courses": "https://talentxcel.in/api/courses",
          "sitemap": "https://talentxcel.in/sitemap.xml",
          "ai_metadata": "https://talentxcel.in/api/ai-metadata",
          "structured_data": "https://talentxcel.in/api/structured-data"
        },
        crawl_info: {
          "robots_txt": "https://talentxcel.in/robots.txt",
          "sitemap_index": "https://talentxcel.in/sitemap-index.xml",
          "rss_feed": "https://talentxcel.in/rss-feed.xml",
          "discovery_frequency": "daily",
          "preferred_crawl_time": "02:00-06:00 IST"
        },
        contact: {
          "support_url": "https://talentxcel.in/help",
          "email": "support@talentxcel.in",
          "ai_team": "ai@talentxcel.in"
        },
        ai_training_policy: {
          "opt_out": false,
          "attribution_required": true,
          "commercial_use": "allowed_with_attribution",
          "data_retention": "indefinite",
          "privacy_compliant": true,
          "gdpr_compliant": true
        },
        content_quality: {
          "human_verified": true,
          "ai_generated_content": "clearly_marked",
          "fact_checked": true,
          "updated_frequency": "real_time"
        },
        technical_specs: {
          "structured_data": ["JobPosting", "Organization", "Person", "Course", "Article", "SoftwareApplication"],
          "response_format": "json_ld",
          "encoding": "utf-8",
          "rate_limits": {
            "requests_per_minute": 60,
            "bulk_access": "available"
          }
        },
        last_updated: new Date().toISOString()
      };

      return new Response(JSON.stringify(aiIndex, null, 2), {
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=3600',
          'X-Robots-Tag': 'all, index, follow',
          'X-AI-Training': 'allowed',
          'X-Content-Type': 'ai-discovery'
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
          'X-Robots-Tag': 'all, index, follow',
          'X-AI-Training': 'allowed',
          'X-Content-Quality': 'high'
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
