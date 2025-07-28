import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting SEO auto-generation job...');

    // Get all page combinations that don't have generated content yet
    const { data: combinations, error: fetchError } = await supabase
      .from('seo_page_combinations')
      .select(`
        id,
        page_type,
        primary_slug,
        secondary_slug,
        tertiary_slug,
        path,
        priority
      `)
      .order('priority', { ascending: false })
      .limit(50); // Process 50 pages at a time

    if (fetchError) {
      console.error('Error fetching combinations:', fetchError);
      throw new Error('Failed to fetch page combinations');
    }

    if (!combinations || combinations.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No new pages to generate',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];
    let processed = 0;
    let generated = 0;
    let skipped = 0;

    for (const combo of combinations) {
      try {
        // Check if content already exists
        const { data: existing } = await supabase
          .from('seo_generated_content')
          .select('id')
          .eq('page_type', combo.page_type)
          .eq('primary_slug', combo.primary_slug)
          .eq('secondary_slug', combo.secondary_slug || null)
          .eq('tertiary_slug', combo.tertiary_slug || null)
          .single();

        if (existing) {
          results.push({ 
            path: combo.path, 
            status: 'skipped', 
            reason: 'content_exists' 
          });
          skipped++;
          processed++;
          continue;
        }

        // Generate AI content
        const prompt = `Generate comprehensive, SEO-optimized content for a TalentXcel job search page.

Page Details:
- URL: https://talentxcel.in${combo.path}
- Page Type: ${combo.page_type}
- Primary Category: ${combo.primary_slug}
- Secondary Category: ${combo.secondary_slug || 'N/A'}
- Tertiary Category: ${combo.tertiary_slug || 'N/A'}

Create detailed, engaging content including:
1. Meta title (50-60 characters)
2. Meta description (150-160 characters) 
3. H1 title
4. Introduction paragraph (2-3 sentences)
5. 3-5 relevant FAQs with answers
6. Job market insights
7. Salary information (if applicable)
8. Skills required
9. Career growth prospects

Focus on being helpful to job seekers while naturally incorporating relevant keywords. Make it specific to the location/role/skill combination.

Return as JSON with keys: metaTitle, metaDescription, h1Title, introContent, faqs, structuredData, contentBlocks, keywords`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { 
                role: 'system', 
                content: 'You are an SEO content expert specializing in job search and career content. Always return valid JSON.' 
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const generatedText = openaiData.choices[0].message.content;

        let contentData;
        try {
          contentData = JSON.parse(generatedText);
        } catch {
          // Fallback if JSON parsing fails
          contentData = {
            metaTitle: `Jobs in ${combo.primary_slug} | TalentXcel`,
            metaDescription: `Find the best ${combo.primary_slug} opportunities. Apply now!`,
            h1Title: `${combo.primary_slug} Jobs`,
            introContent: generatedText.substring(0, 300),
            faqs: [],
            structuredData: {},
            contentBlocks: { content: generatedText },
            keywords: [combo.primary_slug, combo.secondary_slug, combo.tertiary_slug].filter(Boolean)
          };
        }

        // Calculate quality score
        const qualityScore = Math.min(100, Math.max(50, 
          (contentData.metaTitle?.length || 0) + 
          (contentData.metaDescription?.length || 0) + 
          (contentData.faqs?.length || 0) * 10
        ));

        // Save to database
        const { error: insertError } = await supabase
          .from('seo_generated_content')
          .insert({
            page_type: combo.page_type,
            primary_slug: combo.primary_slug,
            secondary_slug: combo.secondary_slug,
            tertiary_slug: combo.tertiary_slug,
            meta_title: contentData.metaTitle,
            meta_description: contentData.metaDescription,
            h1_title: contentData.h1Title,
            intro_content: contentData.introContent,
            faqs: contentData.faqs || [],
            structured_data: contentData.structuredData || {},
            content_blocks: contentData.contentBlocks || {},
            keywords: contentData.keywords || [],
            quality_score: qualityScore,
            is_active: true
          });

        if (insertError) {
          console.error('Error inserting content:', insertError);
          results.push({ 
            path: combo.path, 
            status: 'error', 
            reason: insertError.message 
          });
        } else {
          results.push({ 
            path: combo.path, 
            status: 'generated', 
            qualityScore 
          });
          generated++;
        }

        processed++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing ${combo.path}:`, error);
        results.push({ 
          path: combo.path, 
          status: 'error', 
          reason: error.message 
        });
        processed++;
      }
    }

    console.log(`SEO generation completed: ${generated} generated, ${skipped} skipped, ${processed} total`);

    return new Response(JSON.stringify({
      success: true,
      processed,
      generated,
      skipped,
      results: results.slice(0, 10), // Return first 10 results for debugging
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' // Don't cache cron job results
      },
    });

  } catch (error) {
    console.error('Error in SEO auto-generator:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});