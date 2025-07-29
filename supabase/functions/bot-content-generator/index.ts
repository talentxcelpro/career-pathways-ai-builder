import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Configuration and environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

// Function configuration
export const config = {
  maxDuration: 30, // 30 seconds timeout
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Bot Content Generator Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Timestamp:', new Date().toISOString());
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error',
          details: 'Missing Supabase configuration'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication required',
          details: 'Missing or invalid authorization header'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const jwt = authHeader.split(' ')[1];
    console.log('JWT token present:', !!jwt);
    
    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      console.error('Authentication verification failed:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication failed',
          details: authError?.message || 'Invalid or expired token'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('User authenticated successfully:', user.id);
    
    if (!deepseekApiKey) {
      console.log('Warning: DeepSeek API key not configured, using mock responses');
    } else {
      console.log('DeepSeek API key is configured');
    }
    
    // Parse request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
      console.log('Request body parsed successfully:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format',
          details: 'Request body must be valid JSON'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { botId, contentType = 'post', category, customPrompt, bulkGenerate, count = 50 } = requestBody;

    console.log(`Bot content generation request: ${bulkGenerate ? 'bulk' : 'single'}`, {
      botId, contentType, category, customPrompt: !!customPrompt, bulkGenerate, count
    });

    // Create service role client for database operations
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    if (bulkGenerate) {
      return await handleBulkGeneration(serviceSupabase, count);
    } else {
      return await handleSingleGeneration(serviceSupabase, botId, contentType, category, customPrompt);
    }
  } catch (error) {
    console.error('=== Error in bot content generator ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Timestamp:', new Date().toISOString());
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSingleGeneration(
  supabase: any,
  botId: string,
  contentType: string,
  category: string,
  customPrompt?: string
) {
  console.log('=== Single Content Generation ===');
  console.log('Parameters:', { botId, contentType, category, hasCustomPrompt: !!customPrompt });
  
  if (!botId || !category) {
    throw new Error('Bot ID and category are required');
  }

  // Get bot details
  console.log('Fetching bot details for ID:', botId);
  const { data: bot, error: botError } = await supabase
    .from('ai_bots')
    .select('*')
    .eq('id', botId)
    .eq('is_active', true)
    .single();

  if (botError) {
    console.error('Bot fetch error:', botError);
    throw new Error(`Failed to fetch bot: ${botError.message}`);
  }

  if (!bot) {
    console.error('Bot not found or inactive');
    throw new Error('Bot not found or inactive');
  }

  console.log('Bot found:', { name: bot.name, role: bot.role, domains: bot.content_domains });

  // Generate content using AI
  console.log('Generating AI content...');
  const content = await generateAIContent(bot, contentType, category, customPrompt);
  console.log('Content generated:', { title: content.title, bodyLength: content.body?.length });

  // Store generated content
  console.log('Storing generated content in database...');
  const { data: generatedContent, error: insertError } = await supabase
    .from('bot_generated_content')
    .insert({
      bot_id: botId,
      content_type: contentType,
      title: content.title,
      content: content.body,
      meta_data: {
        category,
        tone: bot.tone_style,
        bot_personality: bot.bot_config?.personality || 'professional'
      },
      seo_keywords: content.keywords || [],
      status: 'draft',
      ai_model_used: 'deepseek-chat',
      generation_cost: 0.002 // Estimated cost
    })
    .select()
    .single();

  if (insertError) {
    console.error('Database insert error:', insertError);
    throw new Error(`Failed to save content: ${insertError.message}`);
  }

  console.log('Content stored successfully with ID:', generatedContent.id);

  return new Response(
    JSON.stringify({ 
      success: true, 
      content: generatedContent,
      message: 'Content generated successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleBulkGeneration(supabase: any, count: number) {
  // Get all active bots
  const { data: bots, error: botsError } = await supabase
    .from('ai_bots')
    .select('*')
    .eq('is_active', true);

  if (botsError || !bots || bots.length === 0) {
    throw new Error('No active bots found');
  }

  const categories = [
    'Job Alerts',
    'Career Growth Tips',
    'Resume/Interview',
    'Motivation/Stories',
    'Learning & Upskill',
    'Company/Market News',
    'Mentorship & Support',
    'Tools/Tutorials'
  ];

  const contentTypes = ['post', 'article', 'newsletter'];
  const results = [];

  // Distribute content generation across bots
  const contentPerBot = Math.ceil(count / bots.length);

  for (const bot of bots) {
    const botCategories = categories.filter(cat => 
      bot.content_domains.some((domain: string) => 
        cat.toLowerCase().includes(domain.toLowerCase()) || 
        domain.toLowerCase().includes(cat.toLowerCase())
      )
    );

    if (botCategories.length === 0) {
      // Fallback to all categories if no match
      botCategories.push(...categories.slice(0, 2));
    }

    for (let i = 0; i < contentPerBot && results.length < count; i++) {
      try {
        const category = botCategories[i % botCategories.length];
        const contentType = contentTypes[i % contentTypes.length];
        
        const content = await generateAIContent(bot, contentType, category);

        const { data: generatedContent, error: insertError } = await supabase
          .from('bot_generated_content')
          .insert({
            bot_id: bot.id,
            content_type: contentType,
            title: content.title,
            content: content.body,
            meta_data: {
              category,
              tone: bot.tone_style,
              bot_personality: bot.bot_config?.personality || 'professional',
              auto_generated: true
            },
            seo_keywords: content.keywords || [],
            status: 'draft',
            ai_model_used: 'deepseek-chat',
            generation_cost: 0.002
          })
          .select()
          .single();

        if (!insertError) {
          results.push({
            bot: bot.name,
            category,
            contentType,
            title: content.title,
            status: 'success'
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error generating content for bot ${bot.name}:`, error);
        results.push({
          bot: bot.name,
          status: 'error',
          error: error.message
        });
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      results,
      generated: results.filter(r => r.status === 'success').length,
      total: count,
      message: `Bulk generation completed: ${results.filter(r => r.status === 'success').length}/${count} content pieces generated`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateAIContent(bot: any, contentType: string, category: string, customPrompt?: string) {
  if (!deepseekApiKey) {
    // Mock content generation for demo purposes
    return {
      title: `${category} - ${bot.name}'s Insights`,
      body: `This is a sample ${contentType} about ${category} generated by ${bot.name} with a ${bot.tone_style} tone. This content would normally be generated by AI but is mocked for demonstration purposes.`,
      keywords: [category.toLowerCase().replace(/\s+/g, '-'), bot.role.toLowerCase().replace(/\s+/g, '-')]
    };
  }

  const systemMessage = `You are ${bot.name}, a ${bot.role} at TalentXcel with expertise in ${bot.content_domains.join(', ')}. 
Your personality is ${bot.bot_config?.personality || 'professional'} and your tone is ${bot.tone_style}.
You create engaging content for the TalentXcel platform to help users with their career development.`;

  const enhancedPrompt = `${customPrompt || generateCategoryPrompt(category, contentType, bot)}

Please format your response as follows:
- Start with a compelling title on the first line
- Provide engaging, detailed content in the body
- Use professional language with a ${bot.tone_style} tone
- Make it practical and actionable for TalentXcel users
- Include specific examples and insights where possible
- Keep the content relevant to ${bot.content_domains.join(', ')} expertise`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: enhancedPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the content to extract title and body
    const lines = content.split('\n').filter((line: string) => line.trim());
    const title = lines[0].replace(/^(Title:|#)\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim();

    // Extract keywords based on category and bot expertise
    const keywords = [
      category.toLowerCase().replace(/\s+/g, '-'),
      ...bot.content_domains.map((domain: string) => domain.toLowerCase().replace(/\s+/g, '-')),
      bot.role.toLowerCase().replace(/\s+/g, '-')
    ].slice(0, 5);

    return { title, body, keywords };
  } catch (error) {
    console.error('DeepSeek API error:', error);
    // Fallback to mock content
    return {
      title: `${category} - Expert Insights from ${bot.name}`,
      body: `This ${contentType} provides valuable insights about ${category}. As a ${bot.role}, I believe this is crucial for career development. [Content would be AI-generated with proper DeepSeek integration]`,
      keywords: [category.toLowerCase().replace(/\s+/g, '-'), bot.role.toLowerCase().replace(/\s+/g, '-')]
    };
  }
}

function generateCategoryPrompt(category: string, contentType: string, bot: any): string {
  const prompts: Record<string, string> = {
    'Job Alerts': `Create a ${contentType} about the latest job opportunities in ${bot.content_domains.join(' and ')}. Include trending roles, salary insights, and application tips.`,
    'Career Growth Tips': `Write a ${contentType} with actionable career advancement advice. Focus on practical steps professionals can take to grow in their careers.`,
    'Resume/Interview': `Create a ${contentType} about resume optimization and interview preparation. Include specific tips and best practices.`,
    'Motivation/Stories': `Write an inspiring ${contentType} that motivates professionals. Share success stories or motivational insights.`,
    'Learning & Upskill': `Create a ${contentType} about skill development and learning opportunities. Focus on in-demand skills and learning paths.`,
    'Company/Market News': `Write a ${contentType} about current industry trends and company insights. Include market analysis and professional implications.`,
    'Mentorship & Support': `Create a ${contentType} about mentorship and professional support. Include guidance on finding mentors and building professional networks.`,
    'Tools/Tutorials': `Write a ${contentType} about professional tools and how-to guides. Focus on practical tutorials and tool recommendations.`
  };

  return prompts[category] || `Create a ${contentType} about ${category} that would be valuable for professionals on TalentXcel.`;
}