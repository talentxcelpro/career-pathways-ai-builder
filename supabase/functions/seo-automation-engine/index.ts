import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationRequest {
  automationType: 'technical_audit' | 'internal_linking' | 'meta_optimization' | 'content_gaps' | 'schema_markup';
  url: string;
  targetKeywords?: string[];
  competitorUrls?: string[];
  industry?: string;
}

interface AutomationResult {
  success: boolean;
  results?: {
    automationType: string;
    tasksCompleted: number;
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      issue: string;
      solution: string;
      impact: string;
      implementation: string;
    }>;
    technicalIssues?: Array<{
      type: string;
      severity: string;
      description: string;
      fix: string;
    }>;
    internalLinks?: Array<{
      sourceUrl: string;
      targetUrl: string;
      anchorText: string;
      relevanceScore: number;
    }>;
    contentGaps?: Array<{
      keyword: string;
      difficulty: number;
      volume: number;
      competitorCoverage: string[];
      recommendedAction: string;
    }>;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      automationType,
      url,
      targetKeywords = [],
      competitorUrls = [],
      industry = 'technology'
    }: AutomationRequest = await req.json();

    console.log(`🤖 Running SEO automation: ${automationType} for ${url}`);

    let automationPrompt = '';
    let systemMessage = '';

    switch (automationType) {
      case 'technical_audit':
        systemMessage = 'You are an expert technical SEO auditor that identifies and prioritizes technical issues affecting search performance.';
        automationPrompt = generateTechnicalAuditPrompt(url, industry);
        break;
      
      case 'internal_linking':
        systemMessage = 'You are an expert internal linking strategist that creates logical, SEO-beneficial link structures.';
        automationPrompt = generateInternalLinkingPrompt(url, targetKeywords, industry);
        break;
      
      case 'meta_optimization':
        systemMessage = 'You are an expert meta tag optimizer that creates compelling, SEO-optimized meta titles and descriptions.';
        automationPrompt = generateMetaOptimizationPrompt(url, targetKeywords, industry);
        break;
      
      case 'content_gaps':
        systemMessage = 'You are an expert content strategist that identifies keyword and content opportunities.';
        automationPrompt = generateContentGapPrompt(url, targetKeywords, competitorUrls, industry);
        break;
      
      case 'schema_markup':
        systemMessage = 'You are an expert structured data specialist that implements comprehensive schema markup.';
        automationPrompt = generateSchemaMarkupPrompt(url, industry);
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: automationPrompt }
        ],
        max_completion_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const automationResults = JSON.parse(data.choices[0].message.content);

    // Enhanced results with automation metadata
    const enhancedResults = {
      ...automationResults,
      automationType,
      executedAt: new Date().toISOString(),
      url,
      industry,
      automationScore: calculateAutomationScore(automationResults),
      estimatedImpact: estimateImpact(automationType, automationResults),
      implementationTime: estimateImplementationTime(automationType, automationResults)
    };

    console.log(`✅ SEO automation completed: ${automationType}`);

    const result: AutomationResult = {
      success: true,
      results: enhancedResults
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('SEO Automation Engine error:', error);
    
    const errorResponse: AutomationResult = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateTechnicalAuditPrompt(url: string, industry: string): string {
  return `Perform a comprehensive technical SEO audit for: ${url}
Industry: ${industry}

Analyze and provide recommendations for:
1. Page Speed & Core Web Vitals
2. Mobile-First Indexing
3. URL Structure & Redirects
4. SSL & Security
5. Crawlability & Indexability
6. XML Sitemaps
7. Robots.txt
8. Schema Markup
9. Canonical Tags
10. Hreflang Implementation

Return JSON format:
{
  "tasksCompleted": 10,
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "Page Speed",
      "issue": "Description of issue",
      "solution": "Specific fix",
      "impact": "Expected improvement",
      "implementation": "How to implement"
    }
  ],
  "technicalIssues": [
    {
      "type": "Core Web Vitals",
      "severity": "high|medium|low",
      "description": "Issue description",
      "fix": "Solution steps"
    }
  ]
}`;
}

function generateInternalLinkingPrompt(url: string, keywords: string[], industry: string): string {
  return `Create an intelligent internal linking strategy for: ${url}
Target Keywords: ${keywords.join(', ')}
Industry: ${industry}

Generate strategic internal links that:
1. Distribute page authority effectively
2. Create topical relevance clusters
3. Improve user navigation
4. Support target keywords
5. Follow SEO best practices

Return JSON format:
{
  "tasksCompleted": 1,
  "recommendations": [...],
  "internalLinks": [
    {
      "sourceUrl": "/source-page",
      "targetUrl": "/target-page",
      "anchorText": "optimized anchor text",
      "relevanceScore": 95
    }
  ]
}`;
}

function generateMetaOptimizationPrompt(url: string, keywords: string[], industry: string): string {
  return `Optimize meta tags for: ${url}
Target Keywords: ${keywords.join(', ')}
Industry: ${industry}

Create optimized meta titles and descriptions that:
1. Include primary keywords naturally
2. Stay within character limits (60/160)
3. Are compelling for click-through
4. Match search intent
5. Are unique and descriptive

Return JSON format with recommendations for meta optimization.`;
}

function generateContentGapPrompt(url: string, keywords: string[], competitors: string[], industry: string): string {
  return `Identify content gaps and opportunities for: ${url}
Target Keywords: ${keywords.join(', ')}
Competitors: ${competitors.join(', ')}
Industry: ${industry}

Analyze:
1. Keyword gaps vs competitors
2. Content topic opportunities
3. User intent analysis
4. Search volume potential
5. Content format opportunities

Return JSON format:
{
  "tasksCompleted": 1,
  "recommendations": [...],
  "contentGaps": [
    {
      "keyword": "target keyword",
      "difficulty": 65,
      "volume": 1200,
      "competitorCoverage": ["competitor1.com"],
      "recommendedAction": "Create comprehensive guide"
    }
  ]
}`;
}

function generateSchemaMarkupPrompt(url: string, industry: string): string {
  return `Generate comprehensive schema markup for: ${url}
Industry: ${industry}

Create structured data for:
1. Organization/Business
2. WebSite
3. BreadcrumbList
4. FAQ (if applicable)
5. Article/BlogPosting
6. Product (if applicable)
7. LocalBusiness (if applicable)
8. Reviews/Ratings

Return JSON format with schema markup recommendations and implementation code.`;
}

function calculateAutomationScore(results: any): number {
  // Calculate automation effectiveness score
  const completedTasks = results.tasksCompleted || 0;
  const recommendationsCount = results.recommendations?.length || 0;
  return Math.min(100, (completedTasks * 10) + (recommendationsCount * 2));
}

function estimateImpact(automationType: string, results: any): string {
  const impactMap: { [key: string]: string } = {
    'technical_audit': 'High - Improves site foundation',
    'internal_linking': 'Medium - Distributes page authority',
    'meta_optimization': 'Medium - Improves CTR',
    'content_gaps': 'High - Captures new traffic',
    'schema_markup': 'Medium - Enhances SERP features'
  };
  return impactMap[automationType] || 'Medium - Positive SEO impact';
}

function estimateImplementationTime(automationType: string, results: any): string {
  const timeMap: { [key: string]: string } = {
    'technical_audit': '2-4 weeks',
    'internal_linking': '1-2 weeks',
    'meta_optimization': '1 week',
    'content_gaps': '4-8 weeks',
    'schema_markup': '1-2 weeks'
  };
  return timeMap[automationType] || '1-2 weeks';
}