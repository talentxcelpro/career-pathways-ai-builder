import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log(`Analyzing SEO for URL: ${url}`);

    // Parse the URL to get basic info
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML content, length: ${html.length}`);

    // Extract SEO elements using regex patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const description = metaDescMatch ? metaDescMatch[1].trim() : '';

    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const keywords = keywordsMatch ? keywordsMatch[1].trim() : '';

    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const ogImage = ogImageMatch ? ogImageMatch[1].trim() : '';

    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';

    // Count images and alt tags
    const imageMatches = html.match(/<img[^>]*>/gi) || [];
    const imagesWithAlt = imageMatches.filter(img => /alt=["'][^"']*["']/i.test(img)).length;
    const totalImages = imageMatches.length;

    // Count headings
    const h1Matches = html.match(/<h1[^>]*>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>/gi) || [];
    const h3Matches = html.match(/<h3[^>]*>/gi) || [];

    // Check for structured data
    const structuredDataMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi);
    const hasStructuredData = !!structuredDataMatch;

    // Analyze SEO issues
    const issues = [];
    const opportunities = [];
    const warnings = [];

    // Title analysis
    if (!title) {
      issues.push({
        type: 'error',
        category: 'Content',
        title: 'Missing Title Tag',
        description: 'Page is missing a title tag',
        impact: 'high',
        priority: 1
      });
    } else if (title.length < 30) {
      warnings.push({
        type: 'warning',
        category: 'Content',
        title: 'Short Title Tag',
        description: `Title is only ${title.length} characters (recommended: 30-60)`,
        impact: 'medium',
        priority: 2
      });
    } else if (title.length > 60) {
      warnings.push({
        type: 'warning',
        category: 'Content',
        title: 'Long Title Tag',
        description: `Title is ${title.length} characters (recommended: 30-60)`,
        impact: 'medium',
        priority: 2
      });
    }

    // Meta description analysis
    if (!description) {
      issues.push({
        type: 'error',
        category: 'Content',
        title: 'Missing Meta Description',
        description: 'Page is missing a meta description',
        impact: 'high',
        priority: 1
      });
    } else if (description.length < 120) {
      warnings.push({
        type: 'warning',
        category: 'Content',
        title: 'Short Meta Description',
        description: `Meta description is only ${description.length} characters (recommended: 120-160)`,
        impact: 'medium',
        priority: 2
      });
    } else if (description.length > 160) {
      warnings.push({
        type: 'warning',
        category: 'Content',
        title: 'Long Meta Description',
        description: `Meta description is ${description.length} characters (recommended: 120-160)`,
        impact: 'medium',
        priority: 2
      });
    }

    // Heading structure analysis
    if (h1Matches.length === 0) {
      issues.push({
        type: 'error',
        category: 'Content',
        title: 'Missing H1 Tag',
        description: 'Page is missing an H1 tag',
        impact: 'high',
        priority: 1
      });
    } else if (h1Matches.length > 1) {
      warnings.push({
        type: 'warning',
        category: 'Content',
        title: 'Multiple H1 Tags',
        description: `Page has ${h1Matches.length} H1 tags (recommended: 1)`,
        impact: 'medium',
        priority: 2
      });
    }

    // Image alt text analysis
    const imagesWithoutAlt = totalImages - imagesWithAlt;
    if (imagesWithoutAlt > 0) {
      warnings.push({
        type: 'warning',
        category: 'Accessibility',
        title: 'Missing Image Alt Text',
        description: `${imagesWithoutAlt} out of ${totalImages} images are missing alt text`,
        impact: 'medium',
        priority: 2
      });
    }

    // Structured data opportunities
    if (!hasStructuredData) {
      opportunities.push({
        type: 'opportunity',
        category: 'Structured Data',
        title: 'Add Structured Data',
        description: 'Consider adding structured data markup for better search visibility',
        impact: 'medium',
        priority: 3
      });
    }

    // Calculate overall SEO score
    let score = 100;
    score -= issues.length * 15; // Each error -15 points
    score -= warnings.length * 8; // Each warning -8 points
    score += opportunities.length * 5; // Each opportunity +5 points
    score = Math.max(0, Math.min(100, score));

    const result = {
      url,
      domain,
      score,
      analysis: {
        title: {
          content: title,
          length: title.length,
          exists: !!title
        },
        description: {
          content: description,
          length: description.length,
          exists: !!description
        },
        keywords: {
          content: keywords,
          exists: !!keywords
        },
        images: {
          total: totalImages,
          withAlt: imagesWithAlt,
          withoutAlt: imagesWithoutAlt
        },
        headings: {
          h1: h1Matches.length,
          h2: h2Matches.length,
          h3: h3Matches.length
        },
        technical: {
          hasCanonical: !!canonical,
          hasOgImage: !!ogImage,
          hasStructuredData
        }
      },
      issues: [...issues, ...warnings],
      opportunities,
      recommendations: [
        'Optimize title tag length (30-60 characters)',
        'Write compelling meta descriptions (120-160 characters)',
        'Add alt text to all images',
        'Implement proper heading hierarchy',
        'Add structured data markup',
        'Ensure mobile responsiveness'
      ],
      timestamp: new Date().toISOString()
    };

    console.log(`SEO analysis completed with score: ${score}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('SEO analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});