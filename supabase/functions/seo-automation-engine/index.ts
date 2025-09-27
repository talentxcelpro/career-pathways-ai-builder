import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface SEOPageRequest {
  pageType: 'job' | 'profile' | 'company' | 'location' | 'skill' | 'industry' | 'salary' | 'category'
  primarySlug: string
  secondarySlug?: string
  tertiarySlug?: string
  batchSize?: number
  priority?: 'high' | 'medium' | 'low'
}

interface SEOContent {
  metaTitle: string
  metaDescription: string
  h1Title: string
  introContent: string
  mainContent: string
  faqs: Array<{ question: string; answer: string }>
  structuredData: any
  keywords: string[]
  canonicalUrl: string
  breadcrumbs: Array<{ name: string; url: string }>
}

console.log('🚀 SEO Automation Engine starting...');

// Use a more robust approach to prevent function shutdown
const FUNCTION_TIMEOUT = 300000; // 5 minutes
let activeRequests = 0;
let lastActivity = Date.now();

// Keep function alive with a persistent interval
const keepAliveInterval = setInterval(() => {
  const now = Date.now();
  if (now - lastActivity < FUNCTION_TIMEOUT) {
    console.log(`💚 Function keepalive - Active requests: ${activeRequests}, Last activity: ${new Date(lastActivity).toISOString()}`);
  }
}, 30000);

// Function to mark activity
const markActivity = () => {
  lastActivity = Date.now();
};

// Function to track request lifecycle
const trackRequest = (type: 'start' | 'end') => {
  if (type === 'start') {
    activeRequests++;
    markActivity();
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
    markActivity();
  }
  console.log(`📊 Request tracking: ${type} - Active: ${activeRequests}`);
};

// Validate environment variables immediately
function validateEnvironment() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is missing');
  }
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
  }
  
  console.log('✅ Environment variables validated');
  return { supabaseUrl, serviceRoleKey };
}

Deno.serve(async (req) => {
  trackRequest('start');
  console.log(`📡 Request received: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('⚡ CORS preflight request - maintaining function lifecycle');
      
      // Create a short delay to prevent immediate shutdown
      setTimeout(() => {
        console.log('⏳ Post-CORS delay completed, function ready for POST requests');
      }, 500);
      
      trackRequest('end');
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }

    // Health check endpoint - doesn't require database
    if (req.method === 'GET') {
      const url = new URL(req.url);
      if (url.pathname.includes('health')) {
        console.log('💚 Health check request');
        trackRequest('end');
        return new Response(JSON.stringify({
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          message: 'SEO Automation Engine is running',
          activeRequests,
          lastActivity: new Date(lastActivity).toISOString()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Only handle POST requests for main functionality
    if (req.method !== 'POST') {
      console.log(`❌ Method ${req.method} not allowed`);
      trackRequest('end');
      return new Response(JSON.stringify({
        success: false,
        error: 'Only POST requests are supported for main functionality. Use GET /health for health check.'
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Main POST request handling
    console.log('🔍 Validating environment...');
    const { supabaseUrl, serviceRoleKey } = validateEnvironment();
    
    console.log('🔧 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Test database connection with timeout
    console.log('🔌 Testing database connection...');
    const connectionTest = Promise.race([
      supabase
        .from('seo_generated_content')
        .select('count')
        .limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    
    const { error: connectionError } = await connectionTest as any;
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    console.log('✅ Database connection successful');

    // Parse request body
    let requestBody: any;
    try {
      requestBody = await req.json();
      console.log('📦 Request body parsed successfully');
    } catch (e) {
      console.error('❌ Failed to parse request body:', e);
      trackRequest('end');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || requestBody.action;
    console.log(`🎯 Action: ${action || 'bulk-generate (default)'}`);

    // Route to appropriate handler
    let response;
    switch (action) {
      case 'generate':
        console.log('📄 Single page generation requested');
        response = await generateSEOPages(supabase, requestBody);
        break;
      case 'sitemap':
        console.log('🗺️ Sitemap generation requested');
        response = await generateDynamicSitemap(req, supabase);
        break;
      case 'performance':
        console.log('📊 Performance metrics requested');
        response = await getSEOPerformance(req, supabase);
        break;
      case 'status':
        console.log('🔍 Status check requested');
        response = await getSEOStatus(req, supabase);
        break;
      default:
        // Default to bulk generation if requests array is present
        if (requestBody.requests && Array.isArray(requestBody.requests)) {
          console.log('📚 Bulk generation requested (default)');
          response = await bulkGenerateSEOPages(supabase, requestBody);
        } else {
          // Return usage info if no valid request
          response = new Response(JSON.stringify({
            success: true,
            message: 'SEO Automation Engine is running',
            usage: 'Send POST request with requests array for bulk generation',
            example: {
              requests: [{ pageType: 'job', primarySlug: 'software-engineer', secondarySlug: 'bangalore' }],
              batchSize: 10
            }
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
    }

    trackRequest('end');
    return response;

  } catch (error) {
    console.error('💥 SEO Automation Engine error:', error);
    trackRequest('end');
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})

async function generateSEOPages(supabase: any, requestBody: any) {
  const { pageType, primarySlug, secondarySlug, tertiarySlug }: SEOPageRequest = requestBody
  
  // Validate required fields
  if (!pageType || !primarySlug) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing required fields: pageType and primarySlug are required',
      expected: {
        pageType: 'job | profile | company | location | skill | industry | salary | category',
        primarySlug: 'string',
        secondarySlug: 'string (optional)',
        tertiarySlug: 'string (optional)'
      },
      received: requestBody
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  const seoContent = await generateSEOContent(pageType, primarySlug, secondarySlug, tertiarySlug, supabase)
  
  const seoPage = {
    page_type: pageType,
    primary_slug: primarySlug,
    secondary_slug: secondarySlug || null,
    tertiary_slug: tertiarySlug || null,
    meta_title: seoContent.metaTitle,
    meta_description: seoContent.metaDescription,
    h1_title: seoContent.h1Title,
    intro_content: seoContent.introContent,
    content_blocks: { main: seoContent.mainContent },
    faqs: seoContent.faqs,
    structured_data: seoContent.structuredData,
    keywords: seoContent.keywords,
    canonical_url: seoContent.canonicalUrl,
    breadcrumbs: seoContent.breadcrumbs,
    quality_score: calculateQualityScore(seoContent),
    last_generated_at: new Date().toISOString(),
    is_active: true
  }

  const { data: savedContent, error } = await supabase
    .from('seo_generated_content')
    .upsert([seoPage])
    .select()
    .single()

  if (error) throw error

  return new Response(JSON.stringify({
    success: true,
    content: savedContent,
    message: 'SEO page generated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function bulkGenerateSEOPages(supabase: any, requestBody: any) {
  console.log('💥 Starting bulk generation...');
  
  try {
    const { requests, batchSize = 10 }: { requests: SEOPageRequest[], batchSize?: number } = requestBody
    console.log(`📊 Received ${requests.length} requests for background processing`);

    // Validate requests first
    const validRequests = requests.filter(request => {
      if (!request.pageType || !request.primarySlug) {
        console.error('❌ Invalid request data:', request);
        return false;
      }
      return true;
    });

    if (validRequests.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No valid requests found',
        totalAccepted: 0
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Background processing function with proper error handling and keepalive
    const backgroundProcess = async () => {
      try {
        // Small delay to ensure response is sent first
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`🔄 Background: Processing ${validRequests.length} SEO pages...`);
        let processed = 0;
        let failed = 0;

        for (const request of validRequests) {
          try {
            console.log(`📝 Background: Processing ${request.pageType}/${request.primarySlug}/${request.secondarySlug || ''}`);
            
            await processSingleSEOPage(request, supabase);
            processed++;
            
            console.log(`✅ Background: Completed ${request.primarySlug} (${processed}/${validRequests.length})`);
            
            // Mark activity to prevent shutdown
            markActivity();
            
            // Small delay between requests to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (error) {
            failed++;
            console.error(`❌ Background: Failed ${request.primarySlug}:`, error);
          }
        }
        
        console.log(`🎉 Background: Batch complete - ${processed} processed, ${failed} failed`);
      } catch (error) {
        console.error('💥 Background process critical error:', error);
      }
    };

    // Start background processing without awaiting
    backgroundProcess().catch(error => {
      console.error('Background process error:', error);
    });
    
    // Return immediate response so client doesn't timeout
    return new Response(JSON.stringify({
      success: true,
      totalAccepted: validRequests.length,
      status: 'processing',
      message: `Accepted ${validRequests.length} pages for background processing`,
      timestamp: new Date().toISOString()
    }), {
      status: 202, // 202 Accepted - indicates async processing
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 Bulk generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message || 'Failed to initiate bulk generation',
      totalAccepted: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function processSingleSEOPage(request: SEOPageRequest, supabase: any) {
  const content = await generateSEOContent(
    request.pageType,
    request.primarySlug,
    request.secondarySlug,
    request.tertiarySlug,
    supabase
  );
  
  const seoPage = {
    page_type: request.pageType,
    primary_slug: request.primarySlug,
    secondary_slug: request.secondarySlug || null,
    tertiary_slug: request.tertiarySlug || null,
    meta_title: content.metaTitle,
    meta_description: content.metaDescription,
    h1_title: content.h1Title,
    intro_content: content.introContent,
    content_blocks: { main: content.mainContent },
    faqs: content.faqs,
    structured_data: content.structuredData,
    keywords: content.keywords,
    canonical_url: content.canonicalUrl,
    breadcrumbs: content.breadcrumbs,
    quality_score: calculateQualityScore(content),
    last_generated_at: new Date().toISOString(),
    is_active: true
  };
  
  const { data, error } = await supabase
    .from('seo_generated_content')
    .upsert([seoPage])
    .select()
    .single();

  if (error) {
    console.error('❌ Database error:', error);
    throw error;
  }
  
  console.log(`✅ Saved: ${request.primarySlug}`);
  return data;
}

async function generateDynamicSitemap(req: Request, supabase: any) {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>', {
    headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
  });
}

async function getSEOPerformance(req: Request, supabase: any) {
  return new Response(JSON.stringify({ performance: 'good' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getSEOStatus(req: Request, supabase: any) {
  return new Response(JSON.stringify({ status: 'active' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateSEOContent(pageType: string, primarySlug: string, secondarySlug?: string, tertiarySlug?: string, supabase?: any): Promise<SEOContent> {
  const formattedPrimary = formatSlug(primarySlug);
  const formattedSecondary = secondarySlug ? formatSlug(secondarySlug) : '';
  
  return {
    metaTitle: `${formattedPrimary} ${formattedSecondary ? 'in ' + formattedSecondary : ''} | TalentXcel`,
    metaDescription: `Find ${formattedPrimary} opportunities ${formattedSecondary ? 'in ' + formattedSecondary : ''} on TalentXcel`,
    h1Title: `${formattedPrimary} ${formattedSecondary ? 'in ' + formattedSecondary : ''}`,
    introContent: `Discover amazing ${formattedPrimary} opportunities`,
    mainContent: `Content for ${formattedPrimary}`,
    faqs: [],
    structuredData: {},
    keywords: [primarySlug, secondarySlug].filter(Boolean) as string[],
    canonicalUrl: buildSEOUrl(pageType, primarySlug, secondarySlug, tertiarySlug),
    breadcrumbs: []
  }
}

function formatSlug(slug?: string): string {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function buildSEOUrl(pageType: string, primarySlug: string, secondarySlug?: string, tertiarySlug?: string): string {
  const baseUrl = 'https://talentxcel.in';
  const parts = [pageType, primarySlug, secondarySlug, tertiarySlug].filter(Boolean);
  return `${baseUrl}/${parts.join('/')}`;
}

function calculateQualityScore(content: SEOContent): number {
  return 85; // Simple scoring
}
