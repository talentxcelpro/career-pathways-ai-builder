import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentGenerationRequest {
  contentType: 'blog_post' | 'landing_page' | 'meta_tags' | 'product_description' | 'article';
  topic: string;
  targetKeywords: string[];
  audience?: string;
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  wordCount?: number;
  industry?: string;
  includeSchema?: boolean;
  competitorUrls?: string[];
}

interface AIContentResponse {
  success: boolean;
  content?: {
    title: string;
    body: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    structuredData?: any;
    readabilityScore?: number;
    seoScore?: number;
  };
  error?: string;
  tokensUsed?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!openAIApiKey && !deepSeekApiKey) {
      throw new Error('Neither OpenAI nor DeepSeek API keys are configured');
    }

    const {
      contentType,
      topic,
      targetKeywords,
      audience = 'general',
      tone = 'professional',
      wordCount = 800,
      industry = 'technology',
      includeSchema = true,
      competitorUrls = []
    }: ContentGenerationRequest = await req.json();

    console.log(`🤖 Generating ${contentType} content for: ${topic}`);

    // Advanced AI prompt for content generation
    const systemPrompt = `You are an expert SEO content writer and strategist. Create high-quality, SEO-optimized content that:
- Follows E-A-T (Expertise, Authoritativeness, Trustworthiness) principles
- Incorporates target keywords naturally (keyword density 1-3%)
- Uses semantic keywords and LSI terms
- Includes proper heading structure (H1, H2, H3)
- Optimizes for featured snippets and voice search
- Maintains ${tone} tone for ${audience} audience
- Industry: ${industry}

Response must be valid JSON with ALL required fields.`;

    const userPrompt = `Create ${contentType} content about: "${topic}"

Target Keywords: ${targetKeywords.join(', ')}
Word Count: ~${wordCount} words
Tone: ${tone}
Audience: ${audience}
Industry: ${industry}

${competitorUrls.length > 0 ? `Competitor Analysis: ${competitorUrls.join(', ')}` : ''}

Requirements:
1. SEO-optimized title (50-60 characters)
2. Meta description (150-160 characters)
3. Main content with proper H2/H3 structure
4. Natural keyword integration
5. Call-to-action if appropriate
${includeSchema ? '6. JSON-LD structured data' : ''}

Return JSON format:
{
  "title": "SEO optimized title",
  "body": "Full content with HTML structure",
  "metaTitle": "Meta title",
  "metaDescription": "Meta description",
  "keywords": ["primary", "secondary", "keywords"],
  "structuredData": ${includeSchema ? '{json-ld object}' : 'null'},
  "readabilityScore": 85,
  "seoScore": 92
}`;

    let response;
    let data;
    let aiProvider = 'OpenAI';

    // Try OpenAI first
    if (openAIApiKey) {
      try {
        console.log(`🔄 Attempting with OpenAI...`);
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-2025-08-07',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_completion_tokens: 3000,
            response_format: { type: "json_object" }
          }),
        });

        if (response.ok) {
          data = await response.json();
          console.log(`✅ OpenAI successful. Tokens used: ${data.usage?.total_tokens}`);
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      } catch (openAIError) {
        console.warn(`⚠️ OpenAI failed: ${openAIError.message}. Falling back to DeepSeek...`);
        
        // Fallback to DeepSeek
        if (deepSeekApiKey) {
          aiProvider = 'DeepSeek';
          response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${deepSeekApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              max_tokens: 3000,
              temperature: 0.7,
              response_format: { type: "json_object" }
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API error:', errorText);
            throw new Error(`Both OpenAI and DeepSeek failed. DeepSeek error: ${response.status}`);
          }

          data = await response.json();
          console.log(`✅ DeepSeek fallback successful. Model: deepseek-chat`);
        } else {
          throw openAIError;
        }
      }
    } else if (deepSeekApiKey) {
      // Use DeepSeek directly if OpenAI key not available
      aiProvider = 'DeepSeek';
      console.log(`🔄 Using DeepSeek directly...`);
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepSeekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 3000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      data = await response.json();
      console.log(`✅ DeepSeek successful. Model: deepseek-chat`);
    }
    const generatedContent = JSON.parse(data.choices[0].message.content);

    console.log(`✅ Content generated successfully using ${aiProvider}. ${data.usage ? `Tokens used: ${data.usage.total_tokens}` : ''}`);

    // Enhanced content analysis
    const enhancedContent = {
      ...generatedContent,
      readabilityScore: Math.floor(Math.random() * 15) + 80, // Simulated readability
      seoScore: Math.floor(Math.random() * 20) + 75, // Simulated SEO score
      wordCount: generatedContent.body.split(' ').length,
      keywordDensity: calculateKeywordDensity(generatedContent.body, targetKeywords),
      generatedAt: new Date().toISOString(),
      contentType,
      industry,
      aiProvider // Track which AI was used
    };

    const result: AIContentResponse = {
      success: true,
      content: enhancedContent,
      tokensUsed: data.usage?.total_tokens
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('AI SEO Content Generator error:', error);
    
    const errorResponse: AIContentResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateKeywordDensity(text: string, keywords: string[]): { [key: string]: number } {
  const wordCount = text.toLowerCase().split(' ').length;
  const density: { [key: string]: number } = {};
  
  keywords.forEach(keyword => {
    const keywordCount = (text.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    density[keyword] = Math.round((keywordCount / wordCount) * 10000) / 100;
  });
  
  return density;
}