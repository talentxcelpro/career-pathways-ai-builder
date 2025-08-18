import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ContentSpec {
  type: string;
  words: number;
  category: string;
  placement: string;
  style: string;
}

const contentTypes: ContentSpec[] = [
  { 
    type: 'Social Post', 
    words: 175, 
    category: 'Networking', 
    placement: 'Network feed',
    style: 'Professional, concise, engaging'
  },
  { 
    type: 'Article', 
    words: 600, 
    category: 'Insights', 
    placement: 'User walls',
    style: 'Detailed, informative, humanized'
  },
  { 
    type: 'SEO Page', 
    words: 600, 
    category: 'SEO', 
    placement: 'Search optimized pages',
    style: 'Structured, keyword-rich, professional'
  },
  { 
    type: 'Newsletter', 
    words: 1200, 
    category: 'Email Campaigns', 
    placement: 'Email campaigns',
    style: 'Authoritative, persuasive, humanized'
  }
];

const dailyTopics = [
  'AI-powered content automation and productivity tips',
  'Latest trends in professional networking',
  'Enhancing workplace efficiency with AI tools',
  'Career development strategies for modern professionals',
  'Digital transformation in the workplace',
  'Remote work best practices and tools',
  'Professional skills development in the AI era',
  'Building meaningful professional relationships',
  'Industry insights and market trends',
  'Leadership and management in digital age'
];

async function generateAIContent(spec: ContentSpec, topic: string): Promise<any> {
  const systemPrompt = `You are a professional content writer creating ${spec.style.toLowerCase()} content for TalentXcel, a professional networking platform. 

Requirements:
- Write EXACTLY ${spec.words} words
- Use plain text only, NO emojis or casual symbols
- Professional and humanized tone
- Target audience: Working professionals
- Content type: ${spec.type}
- Placement: ${spec.placement}
- Style: ${spec.style}

${spec.type === 'SEO Page' ? 'Include relevant keywords naturally for search optimization.' : ''}
${spec.type === 'Newsletter' ? 'Structure with clear sections and actionable insights.' : ''}
${spec.type === 'Article' ? 'Include practical examples and actionable advice.' : ''}
${spec.type === 'Social Post' ? 'Make it engaging and discussion-worthy for professional networks.' : ''}

Topic: ${topic}

Write the content now, ensuring it meets the exact word count requirement.`;

  const userPrompt = `Create a ${spec.type.toLowerCase()} about "${topic}" that is exactly ${spec.words} words long. The content should be professional, humanized, and ready to publish directly on TalentXcel platform.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: spec.words * 2,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    const wordCount = generatedText.split(/\s+/).length;

    // Generate a professional title
    const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `Create a professional, engaging title for a ${spec.type.toLowerCase()} about "${topic}". Maximum 10 words, no emojis.`
          },
          { role: 'user', content: `Title for: ${generatedText.substring(0, 200)}...` }
        ],
        max_completion_tokens: 50
      }),
    });

    const titleData = await titleResponse.json();
    const title = titleData.choices[0].message.content.replace(/['"]/g, '');

    return {
      title,
      content: generatedText,
      contentType: spec.type,
      topic,
      targetAudience: 'Professionals',
      category: spec.category,
      wordCount,
      metadata: {
        placement: spec.placement,
        style: spec.style,
        generatedAt: new Date().toISOString(),
        wordCountTarget: spec.words,
        actualWordCount: wordCount
      }
    };

  } catch (error) {
    console.error(`Error generating ${spec.type} content:`, error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🏭 Daily Content Factory: Starting generation cycle');
    
    const generationResults = [];
    let totalGenerated = 0;
    let errors = 0;

    // Generate content for each type and topic combination
    for (const contentSpec of contentTypes) {
      console.log(`📝 Generating ${contentSpec.type} content...`);
      
      // Generate 2-3 pieces per content type daily
      const topicsForType = dailyTopics.slice(0, contentSpec.type === 'Newsletter' ? 1 : 2);
      
      for (const topic of topicsForType) {
        try {
          console.log(`   • Topic: ${topic}`);
          
          const generatedContent = await generateAIContent(contentSpec, topic);
          
          // Insert into ai_content_library
          const { data, error } = await supabase
            .from('ai_content_library')
            .insert([
              {
                title: generatedContent.title,
                content: generatedContent.content,
                template_type: generatedContent.contentType.toLowerCase().replace(' ', '_'),
                category: generatedContent.category,
                tags: [
                  generatedContent.contentType.toLowerCase(),
                  'daily_generation',
                  'automated',
                  ...generatedContent.topic.split(' ').slice(0, 3)
                ],
                metadata: {
                  ...generatedContent.metadata,
                  topic: generatedContent.topic,
                  target_audience: generatedContent.targetAudience,
                  content_type: generatedContent.contentType,
                  word_count: generatedContent.wordCount,
                  automated: true,
                  daily_batch: new Date().toISOString().split('T')[0]
                },
                quality_score: 85, // High score for AI-generated content
                is_approved: true, // Auto-approve for automated content
                usage_count: 0
              }
            ]);

          if (error) {
            console.error(`❌ Database insertion error for ${contentSpec.type}:`, error);
            errors++;
          } else {
            console.log(`✅ Successfully generated and stored ${contentSpec.type}`);
            generationResults.push({
              type: contentSpec.type,
              topic: topic,
              title: generatedContent.title,
              wordCount: generatedContent.wordCount,
              contentId: data?.[0]?.id
            });
            totalGenerated++;
          }

        } catch (error) {
          console.error(`❌ Error generating ${contentSpec.type} for topic "${topic}":`, error);
          errors++;
        }
      }
    }

    // Log the generation cycle
    await supabase
      .from('ai_request_logs')
      .insert([
        {
          request_type: 'daily_content_factory',
          input_data: {
            content_types: contentTypes.map(ct => ct.type),
            topics_processed: dailyTopics.slice(0, 6),
            generation_date: new Date().toISOString().split('T')[0]
          },
          output_data: {
            total_generated: totalGenerated,
            errors: errors,
            results: generationResults
          },
          success: errors === 0,
          tokens_used: totalGenerated * 1000, // Estimate
          cost_estimate: totalGenerated * 0.02 // Estimate
        }
      ]);

    console.log(`🎉 Daily Content Factory completed: ${totalGenerated} pieces generated, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily content factory completed successfully',
        summary: {
          total_generated: totalGenerated,
          errors: errors,
          content_types_processed: contentTypes.length,
          generation_date: new Date().toISOString().split('T')[0]
        },
        results: generationResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Daily Content Factory failed:', error);
    
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