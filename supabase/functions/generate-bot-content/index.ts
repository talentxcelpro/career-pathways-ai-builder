import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BotContentRequest {
  bot_id?: string;
  trigger_type?: 'single' | 'daily' | 'weekly' | 'all';
  template_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Bot Content Generation triggered');
    const requestData: BotContentRequest = await req.json().catch(() => ({}));
    
    let botsToProcess = [];
    
    if (requestData.bot_id) {
      // Single bot generation
      const { data: bot, error } = await supabase
        .from('ai_bots')
        .select('*')
        .eq('name', requestData.bot_id)
        .eq('is_active', true)
        .single();
      
      if (error || !bot) {
        throw new Error(`Bot ${requestData.bot_id} not found or inactive`);
      }
      botsToProcess = [bot];
    } else {
      // Multiple bots based on trigger type
      let frequencyFilter = '';
      if (requestData.trigger_type === 'daily') {
        frequencyFilter = 'daily';
      } else if (requestData.trigger_type === 'weekly') {
        frequencyFilter = 'weekly';
      }
      
      const query = supabase
        .from('ai_bots')
        .select('*')
        .eq('is_active', true);
      
      if (frequencyFilter) {
        query.eq('frequency', frequencyFilter);
      }
      
      const { data: bots, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch bots: ${error.message}`);
      }
      
      botsToProcess = bots || [];
    }

    console.log(`📝 Processing ${botsToProcess.length} bots`);
    
    const results = [];
    
    for (const bot of botsToProcess) {
      try {
        console.log(`🎯 Processing bot: ${bot.name} (${bot.role})`);
        
        // Get random template for this bot's content domains
        let template;
        if (requestData.template_id) {
          const { data: specificTemplate } = await supabase
            .from('bot_content_templates')
            .select('*')
            .eq('id', requestData.template_id)
            .eq('is_active', true)
            .single();
          template = specificTemplate;
        } else {
          // Find templates matching bot's content domains
          const { data: templates } = await supabase
            .from('bot_content_templates')
            .select('*')
            .eq('is_active', true)
            .overlaps('content_categories', bot.content_domains)
            .limit(10);
          
          if (templates && templates.length > 0) {
            template = templates[Math.floor(Math.random() * templates.length)];
          }
        }
        
        if (!template) {
          console.log(`⚠️ No template found for bot ${bot.name}`);
          continue;
        }
        
        console.log(`📋 Using template: ${template.template_name}`);
        
        // Generate content using OpenAI
        let generatedContent = '';
        
        if (openAIApiKey) {
          const prompt = `
You are ${bot.name}, a ${bot.role} at TalentXcel. 
Generate engaging content based on this template: "${template.template_content}"

Content Domain: ${bot.content_domains.join(', ')}
Tone: ${bot.tone_style || 'professional'}
Style: ${template.content_style || 'informative'}

Create a ${template.content_type || 'post'} that provides value to professionals and job seekers. 
Include practical tips, insights, or actionable advice.
End with: "🔗 Discover more: talentxcel.in"

Keep it under 300 words and make it engaging for LinkedIn/social media.
`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are an AI content creator for a professional career platform. Create engaging, valuable content that helps professionals grow their careers.' 
                },
                { role: 'user', content: prompt }
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            generatedContent = data.choices[0].message.content;
          } else {
            console.log('⚠️ OpenAI API failed, using template fallback');
          }
        }
        
        // Fallback to template-based content if OpenAI fails
        if (!generatedContent) {
          generatedContent = `
${template.template_content}

Key insights for ${bot.content_domains[0] || 'career growth'}:
• Focus on continuous learning and skill development
• Build meaningful professional relationships
• Stay updated with industry trends
• Practice effective communication

Ready to advance your career? 
🔗 Discover more: talentxcel.in

#CareerGrowth #ProfessionalDevelopment #TalentXcel
`;
        }
        
        // Save generated content to database
        const { data: savedContent, error: saveError } = await supabase
          .from('bot_generated_content')
          .insert([
            {
              bot_id: bot.id,
              bot_name: bot.name,
              template_id: template.id,
              template_name: template.template_name,
              generated_content: generatedContent,
              content_type: template.content_type || 'social_post',
              content_domain: bot.content_domains[0] || 'general',
              generation_metadata: {
                generation_method: openAIApiKey ? 'openai' : 'template',
                bot_role: bot.role,
                content_domains: bot.content_domains,
                tone_style: bot.tone_style,
                timestamp: new Date().toISOString()
              },
              is_approved: false,
              scheduled_publish_at: null
            }
          ])
          .select()
          .single();
        
        if (saveError) {
          throw new Error(`Failed to save content: ${saveError.message}`);
        }
        
        results.push({
          bot_name: bot.name,
          bot_role: bot.role,
          template_used: template.template_name,
          content_generated: true,
          content_id: savedContent.id,
          content_preview: generatedContent.substring(0, 100) + '...',
          generation_method: openAIApiKey ? 'AI-powered' : 'template-based'
        });
        
        console.log(`✅ Content generated for ${bot.name}`);
        
      } catch (botError) {
        console.error(`❌ Error processing bot ${bot.name}:`, botError);
        results.push({
          bot_name: bot.name,
          bot_role: bot.role,
          content_generated: false,
          error: botError.message
        });
      }
    }
    
    // Update bot activity statistics
    await supabase
      .from('bot_content_analytics')
      .upsert(
        results.filter(r => r.content_generated).map(r => ({
          bot_name: r.bot_name,
          content_generated_today: 1,
          last_generation_date: new Date().toISOString().split('T')[0],
          total_content_generated: 1
        })),
        { onConflict: 'bot_name' }
      );
    
    const successCount = results.filter(r => r.content_generated).length;
    const totalCount = results.length;
    
    console.log(`🎉 Content generation complete: ${successCount}/${totalCount} successful`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated content for ${successCount}/${totalCount} bots`,
        results: results,
        summary: {
          total_bots_processed: totalCount,
          successful_generations: successCount,
          failed_generations: totalCount - successCount,
          generation_timestamp: new Date().toISOString(),
          next_suggested_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('❌ Bot content generation failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});