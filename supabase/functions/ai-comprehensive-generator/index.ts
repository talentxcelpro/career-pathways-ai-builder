import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentGenerationJob {
  bot_id: string;
  content_type: string;
  word_count: number;
  category: string;
  seo_keywords: string[];
  prompt: string;
  priority: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting AI Comprehensive Content Generation...');
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not found in environment variables');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get automation schedule
    const { data: schedules } = await supabase
      .from('content_automation_schedule')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!schedules) {
      throw new Error('No active automation schedule found');
    }

    console.log(`📋 Found schedule: ${schedules.schedule_name}`);
    
    // Get all active bots (excluding admin bot)
    const { data: bots } = await supabase
      .from('ai_bots')
      .select('*')
      .eq('is_active', true)
      .neq('name', 'Admin Bot');

    if (!bots || bots.length === 0) {
      throw new Error('No active bots found');
    }

    console.log(`🤖 Found ${bots.length} active bots`);

    // Get content templates
    const { data: templates } = await supabase
      .from('bot_content_templates')
      .select('*')
      .eq('is_active', true);

    if (!templates || templates.length === 0) {
      throw new Error('No active templates found');
    }

    console.log(`📝 Found ${templates.length} active templates`);

    // Calculate content distribution based on schedule
    const distributionRules = schedules.distribution_rules as any;
    const targetCount = schedules.target_count_per_day;
    
    const contentJobs: ContentGenerationJob[] = [];
    
    // Generate jobs for each content type
    for (const [contentType, rules] of Object.entries(distributionRules)) {
      const typeCount = Math.floor(targetCount * (rules as any).percentage / 100);
      const wordRange = (rules as any).word_range;
      
      console.log(`📊 ${contentType}: ${typeCount} pieces (${wordRange[0]}-${wordRange[1]} words)`);
      
      // Distribute across bots
      const botsPerType = Math.ceil(typeCount / bots.length);
      
      for (let i = 0; i < typeCount; i++) {
        const bot = bots[i % bots.length];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // Generate SEO keywords based on bot domains and template
        const seoKeywords = [
          ...bot.content_domains.slice(0, 2),
          'talentxcel',
          'career',
          template.category?.toLowerCase() || 'professional'
        ].filter(Boolean);

        const wordCount = Math.floor(Math.random() * (wordRange[1] - wordRange[0] + 1)) + wordRange[0];

        contentJobs.push({
          bot_id: bot.id,
          content_type: contentType,
          word_count: wordCount,
          category: template.category || 'General',
          seo_keywords: seoKeywords,
          prompt: template.prompt_template || `Write professional content about ${bot.content_domains[0]}`,
          priority: i < typeCount * 0.3 ? 1 : 0 // 30% high priority
        });
      }
    }

    console.log(`🎯 Generated ${contentJobs.length} content jobs`);

    // Process jobs in batches
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < contentJobs.length; i += batchSize) {
      const batch = contentJobs.slice(i, i + batchSize);
      
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contentJobs.length/batchSize)}`);
      
      await Promise.allSettled(batch.map(async (job) => {
        try {
          // Get bot profile for personalization
          const bot = bots.find(b => b.id === job.bot_id);
          if (!bot) return;

          // Create enhanced prompt
          const enhancedPrompt = `
You are ${bot.name}, a ${bot.role} at TalentXcel with expertise in ${bot.content_domains.join(', ')}.

Content Requirements:
- Type: ${job.content_type}
- Length: Exactly ${job.word_count} words
- Category: ${job.category}
- Tone: ${bot.tone_style}
- Keywords to include naturally: ${job.seo_keywords.join(', ')}

Task: ${job.prompt}

Writing Guidelines:
- Write in ${bot.tone_style} tone as ${bot.name}
- Include 2-3 SEO keywords naturally
- Use engaging headlines and clear structure
- Include actionable insights
- End with a call-to-action
- Make it valuable for TalentXcel users

${job.content_type === 'newsletter' ? 'Include sections: Introduction, Main Content, Tips, and Call-to-Action' : ''}
${job.content_type === 'article' ? 'Include: Introduction, 3-4 main points with examples, and conclusion' : ''}
${job.content_type === 'seo_page' ? 'Include: SEO-optimized title, meta description concepts, and keyword-rich content' : ''}

Write the content now:`;

          // Call DeepSeek API
          const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${deepseekApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: `You are a professional content writer specializing in ${job.content_type} creation. Write engaging, valuable content that helps users grow their careers.`
                },
                {
                  role: 'user',
                  content: enhancedPrompt
                }
              ],
              max_tokens: job.content_type === 'newsletter' ? 2000 : job.content_type === 'article' ? 1000 : 600,
              temperature: 0.7,
              top_p: 0.9,
            }),
          });

          if (!deepseekResponse.ok) {
            throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
          }

          const deepseekData = await deepseekResponse.json();
          const generatedContent = deepseekData.choices[0]?.message?.content;

          if (!generatedContent) {
            throw new Error('No content generated');
          }

          // Generate title and slug
          const title = generatedContent.split('\n')[0].replace(/[#*]/g, '').trim() || 
                      `${job.category} - ${job.content_type}`;
          const slug = title.toLowerCase()
                          .replace(/[^a-z0-9\s]/g, '')
                          .replace(/\s+/g, '-')
                          .substring(0, 50);

          // Save generated content
          const { data: savedContent, error: saveError } = await supabase
            .from('bot_generated_content')
            .insert({
              bot_id: job.bot_id,
              content_type: job.content_type,
              title: title,
              content: generatedContent,
              meta_data: {
                word_count: generatedContent.split(' ').length,
                generated_at: new Date().toISOString(),
                automation_batch: true,
                target_word_count: job.word_count
              },
              seo_keywords: job.seo_keywords,
              status: 'approved',
              ai_model_used: 'deepseek-chat',
              generation_cost: 0.01,
            })
            .select()
            .single();

          if (saveError) {
            throw saveError;
          }

          // Auto-publish based on content type
          await autoPublishContent(supabase, savedContent, job.content_type, slug);
          
          successCount++;
          
        } catch (error) {
          console.error(`❌ Error processing job for bot ${job.bot_id}:`, error);
          errorCount++;
        }
      }));

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Batch complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Content generation completed`,
        stats: {
          total_jobs: contentJobs.length,
          successful: successCount,
          failed: errorCount,
          schedule_name: schedules.schedule_name
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in comprehensive content generation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function autoPublishContent(supabase: any, content: any, contentType: string, slug: string) {
  try {
    // Create post in network feed for posts
    if (contentType === 'post') {
      await supabase.from('posts').insert({
        user_id: content.bot_id,
        content: content.content,
        headline: content.title,
        visibility: 'public',
        tags: content.seo_keywords,
        is_ai_generated: true,
        metadata: {
          content_id: content.id,
          automation_generated: true
        }
      });
    }

    // Track publication
    await supabase.from('published_content').insert({
      content_id: content.id,
      bot_id: content.bot_id,
      publication_type: getPublicationType(contentType),
      slug: slug,
      seo_metadata: {
        keywords: content.seo_keywords,
        word_count: content.meta_data?.word_count,
        content_type: contentType
      }
    });

    console.log(`📤 Published ${contentType}: ${content.title}`);
    
  } catch (error) {
    console.error('❌ Publishing error:', error);
  }
}

function getPublicationType(contentType: string): string {
  switch (contentType) {
    case 'post': return 'feed';
    case 'article': return 'wall';
    case 'seo_page': return 'seo_page';
    case 'newsletter': return 'newsletter';
    default: return 'feed';
  }
}