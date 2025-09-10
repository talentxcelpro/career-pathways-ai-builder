import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TechnicalAuditResult {
  url: string;
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  performance: {
    loadTime: number;
    pageSize: number;
    requests: number;
  };
  seo: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    h1Count: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
  };
  mobile: {
    isMobileFriendly: boolean;
    viewport: boolean;
    touchTargets: boolean;
  };
  security: {
    https: boolean;
    mixedContent: boolean;
    hsts: boolean;
  };
}

async function performTechnicalAudit(url: string): Promise<TechnicalAuditResult> {
  const startTime = Date.now();
  let issues: TechnicalAuditResult['issues'] = [];
  
  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TalentXcel SEO Bot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const loadTime = Date.now() - startTime;
    
    // Basic HTML parsing
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    const h1Matches = html.match(/<h1[^>]*>/gi);
    const h1Count = h1Matches ? h1Matches.length : 0;
    
    const imgMatches = html.match(/<img[^>]*>/gi);
    const imagesMissingAlt = imgMatches ? 
      imgMatches.filter(img => !img.includes('alt=')).length : 0;
    
    const internalLinkMatches = html.match(/<a[^>]*href="\/[^"]*"[^>]*>/gi);
    const externalLinkMatches = html.match(/<a[^>]*href="https?:\/\/[^"]*"[^>]*>/gi);
    
    // Security checks
    const isHttps = url.startsWith('https://');
    const hasViewport = html.includes('viewport');
    
    // Generate issues based on analysis
    if (!title) {
      issues.push({
        type: 'error',
        category: 'SEO',
        message: 'Missing page title',
        impact: 'high'
      });
    } else if (title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'SEO',
        message: `Title too long (${title.length} chars, should be ≤60)`,
        impact: 'medium'
      });
    }
    
    if (!description) {
      issues.push({
        type: 'error',
        category: 'SEO',
        message: 'Missing meta description',
        impact: 'high'
      });
    } else if (description.length > 160) {
      issues.push({
        type: 'warning',
        category: 'SEO',
        message: `Meta description too long (${description.length} chars, should be ≤160)`,
        impact: 'medium'
      });
    }
    
    if (h1Count === 0) {
      issues.push({
        type: 'error',
        category: 'SEO',
        message: 'Missing H1 tag',
        impact: 'high'
      });
    } else if (h1Count > 1) {
      issues.push({
        type: 'warning',
        category: 'SEO',
        message: `Multiple H1 tags found (${h1Count})`,
        impact: 'medium'
      });
    }
    
    if (imagesMissingAlt > 0) {
      issues.push({
        type: 'warning',
        category: 'Accessibility',
        message: `${imagesMissingAlt} images missing alt text`,
        impact: 'medium'
      });
    }
    
    if (!isHttps) {
      issues.push({
        type: 'error',
        category: 'Security',
        message: 'Site not using HTTPS',
        impact: 'high'
      });
    }
    
    if (!hasViewport) {
      issues.push({
        type: 'warning',
        category: 'Mobile',
        message: 'Missing viewport meta tag',
        impact: 'medium'
      });
    }
    
    if (loadTime > 3000) {
      issues.push({
        type: 'warning',
        category: 'Performance',
        message: `Slow page load time (${loadTime}ms)`,
        impact: 'high'
      });
    }
    
    // Calculate score
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 15) - (warningCount * 5));
    
    return {
      url,
      score,
      issues,
      performance: {
        loadTime,
        pageSize: html.length,
        requests: 1 // Simplified for now
      },
      seo: {
        title,
        titleLength: title.length,
        description,
        descriptionLength: description.length,
        h1Count,
        imagesMissingAlt,
        internalLinks: internalLinkMatches?.length || 0,
        externalLinks: externalLinkMatches?.length || 0
      },
      mobile: {
        isMobileFriendly: hasViewport,
        viewport: hasViewport,
        touchTargets: true // Simplified
      },
      security: {
        https: isHttps,
        mixedContent: false, // Simplified
        hsts: false // Would need to check headers
      }
    };
    
  } catch (error) {
    console.error('Technical audit failed:', error);
    
    return {
      url,
      score: 0,
      issues: [{
        type: 'error',
        category: 'System',
        message: `Failed to audit: ${error.message}`,
        impact: 'high'
      }],
      performance: { loadTime: 0, pageSize: 0, requests: 0 },
      seo: { title: '', titleLength: 0, description: '', descriptionLength: 0, h1Count: 0, imagesMissingAlt: 0, internalLinks: 0, externalLinks: 0 },
      mobile: { isMobileFriendly: false, viewport: false, touchTargets: false },
      security: { https: false, mixedContent: false, hsts: false }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting technical audit for: ${url}`);
    const result = await performTechnicalAudit(url);
    
    console.log(`Audit completed. Score: ${result.score}, Issues: ${result.issues.length}`);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in technical audit function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});