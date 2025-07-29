import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Health check endpoint
const healthCheck = () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    function: 'bot-content-generator',
    version: '1.0.0'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
};

serve(async (req) => {
  const url = new URL(req.url);
  
  // Health check endpoint
  if (url.pathname === '/health' || req.method === 'GET') {
    return healthCheck();
  }

  // Enhanced logging
  console.log("🚀 Function received request!");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("User-Agent:", req.headers.get('user-agent'));
  console.log("Content-Type:", req.headers.get('content-type'));
  console.log("Authorization:", req.headers.get('authorization') ? 'Present' : 'Missing');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("✅ Handling CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests for content generation
  if (req.method !== 'POST') {
    console.log("❌ Method not allowed:", req.method);
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log("📝 Processing POST request...");
    
    // Parse request body with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    const bodyPromise = req.json();
    const body = await Promise.race([bodyPromise, timeoutPromise]);
    
    console.log("📦 Request body received:", JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const { botId, category, contentType, prompt, bulkGenerate } = body;

    if (!bulkGenerate && (!botId || !category)) {
      throw new Error('Missing required fields: botId and category are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate mock content for now (replace with actual AI generation later)
    const mockContent = {
      id: `generated-${Date.now()}`,
      title: `${category} Content for ${contentType}`,
      content: `This is AI-generated content about ${category}. ${prompt ? `Custom prompt: ${prompt}` : ''}`,
      content_type: contentType || 'post',
      status: 'draft',
      category,
      bot_id: botId,
      generation_cost: 0.01,
      tokens_used: 150,
      created_at: new Date().toISOString(),
      seo_keywords: category === 'Job Alerts' ? ['jobs', 'career', 'hiring'] : ['professional', 'growth']
    };

    console.log("✅ Content generated successfully");
    console.log("📄 Generated content:", JSON.stringify(mockContent, null, 2));

    const response = {
      success: true,
      message: "Content generated successfully!",
      content: mockContent,
      metadata: {
        timestamp: new Date().toISOString(),
        function_version: '1.0.0',
        processing_time: Date.now()
      }
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error("❌ Function error:", error);
    console.error("❌ Error stack:", error.stack);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred',
      details: {
        timestamp: new Date().toISOString(),
        function: 'bot-content-generator',
        error_type: error.name || 'UnknownError'
      }
    };

    const status = error.message.includes('timeout') ? 408 : 
                  error.message.includes('Missing required') ? 400 : 500;

    return new Response(JSON.stringify(errorResponse), {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});