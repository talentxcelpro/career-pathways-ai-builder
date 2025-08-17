import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('🚀 Starting SINGLE AI Content Generation Test...');
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    const useStub = !deepseekApiKey;
    
    console.log(`🔑 DeepSeek API Key Status: ${deepseekApiKey ? 'Found ✅' : 'Missing ❌'}`);
    console.log(`🔄 Using stub mode: ${useStub}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get one active bot for testing
    const { data: testBot } = await supabase
      .from('ai_bots')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!testBot) {
      throw new Error('No active bots found for testing');
    }

    console.log(`🤖 Testing with bot: ${testBot.name} (${testBot.id})`);

    // Generate single piece of content
    let generatedContent;
    let tokenUsage = 0;

    if (useStub) {
      console.log('📝 Generating stub content...');
      generatedContent = `# AI-Powered Productivity in Modern Workplaces

In today's rapidly evolving business landscape, artificial intelligence has become a cornerstone of organizational efficiency. Companies leveraging AI automation report up to 40% improvement in operational productivity.

## Key Benefits of AI Implementation

- **Streamlined Workflows**: Automated processes reduce manual intervention
- **Enhanced Decision Making**: Data-driven insights support strategic planning  
- **Cost Optimization**: Reduced operational expenses through intelligent automation
- **Scalable Solutions**: AI systems adapt to growing business needs

The future belongs to organizations that embrace intelligent automation while maintaining human creativity and strategic oversight.`;
    } else {
      console.log('🔄 Calling DeepSeek API...');
      
      const prompt = `Generate a professional business article about AI automation in the workplace. 
Target audience: business professionals. 
Tone: ${testBot.tone_style || 'professional'}
Word count: approximately 500 words
Include practical insights and actionable recommendations.`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a professional business content writer specializing in AI and technology topics.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ DeepSeek API error: ${response.status} - ${errorText}`);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      generatedContent = data.choices[0].message.content;
      tokenUsage = data.usage?.total_tokens || 0;
      
      console.log(`✅ Content generated successfully! Tokens used: ${tokenUsage}`);
    }

    // Save to database
    const { data: savedContent, error: saveError } = await supabase
      .from('bot_generated_content')
      .insert({
        bot_id: testBot.id,
        content_type: 'article',
        content: generatedContent,
        word_count: generatedContent.split(' ').length,
        seo_keywords: ['AI', 'automation', 'productivity'],
        generated_by: 'deepseek-chat',
        generation_prompt: 'Test single content generation',
        is_published: false,
        quality_score: 0.85
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Database save error:', saveError);
      throw saveError;
    }

    console.log(`💾 Content saved to database with ID: ${savedContent.id}`);

    // Log the activity
    await supabase
      .from('agent_logs')
      .insert({
        agent_id: testBot.id,
        message: `Successfully generated test content: ${generatedContent.split(' ').length} words`,
        level: 'info',
        metadata: { 
          content_id: savedContent.id, 
          token_usage: tokenUsage,
          api_mode: useStub ? 'stub' : 'live'
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Single content generation completed successfully!',
        bot_name: testBot.name,
        content_id: savedContent.id,
        word_count: generatedContent.split(' ').length,
        token_usage: tokenUsage,
        api_mode: useStub ? 'stub' : 'live',
        preview: generatedContent.substring(0, 200) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in content generation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});