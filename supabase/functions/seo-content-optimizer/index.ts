import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, targetKeyword, contentType = 'article', optimizationGoal = 'ranking' } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }

    console.log(`Optimizing content for keyword: ${targetKeyword}, type: ${contentType}`);

    // Analyze content structure and SEO elements
    const contentAnalysis = analyzeContent(content, targetKeyword);

    // Generate optimization suggestions using AI
    const optimizationPrompt = `You are an expert SEO content optimizer. Analyze this content and provide optimization recommendations:

Content to optimize:
"${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}"

Target keyword: "${targetKeyword}"
Content type: ${contentType}
Goal: ${optimizationGoal}

Provide optimization recommendations in this JSON format:
{
  "keywordOptimization": {
    "density": number,
    "recommendations": ["array of specific keyword placement suggestions"]
  },
  "contentStructure": {
    "headings": ["suggested H2 and H3 headings"],
    "sections": ["recommended content sections"]
  },
  "readability": {
    "score": number,
    "improvements": ["specific readability improvements"]
  },
  "seoElements": {
    "titleSuggestions": ["3 optimized title suggestions"],
    "metaDescriptions": ["3 meta description options"],
    "snippetOptimization": ["featured snippet optimization tips"]
  },
  "contentGaps": ["missing topics that should be covered"],
  "competitorAnalysis": {
    "commonTopics": ["topics competitors cover"],
    "uniqueAngles": ["unique angles to differentiate"]
  }
}`;

    let optimizationSuggestions;

    if (openAIApiKey) {
      try {
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
                content: 'You are an expert SEO content strategist with deep knowledge of search engine optimization and content marketing best practices.' 
              },
              { role: 'user', content: optimizationPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500
          }),
        });

        if (response.ok) {
          const aiData = await response.json();
          optimizationSuggestions = JSON.parse(aiData.choices[0].message.content);
        } else {
          throw new Error('AI API failed');
        }
      } catch (aiError) {
        console.warn('AI optimization failed, using fallback:', aiError);
        optimizationSuggestions = generateFallbackOptimization(targetKeyword, contentType);
      }
    } else {
      optimizationSuggestions = generateFallbackOptimization(targetKeyword, contentType);
    }

    const result = {
      originalContent: {
        wordCount: contentAnalysis.wordCount,
        keywordDensity: contentAnalysis.keywordDensity,
        readabilityScore: contentAnalysis.readabilityScore
      },
      analysis: contentAnalysis,
      optimization: optimizationSuggestions,
      seoScore: calculateSEOScore(contentAnalysis, optimizationSuggestions),
      actionableSteps: generateActionableSteps(contentAnalysis, optimizationSuggestions),
      priority: prioritizeOptimizations(contentAnalysis, optimizationSuggestions),
      timestamp: new Date().toISOString()
    };

    console.log(`Content optimization completed with SEO score: ${result.seoScore}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Content optimization error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeContent(content: string, targetKeyword: string) {
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  // Keyword analysis
  const keywordMatches = content.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || [];
  const keywordDensity = (keywordMatches.length / words.length) * 100;

  // Readability analysis (simplified Flesch reading ease)
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = 1.5; // Simplified estimate
  const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  // Heading analysis
  const headings = content.match(/#{1,6}\s+.+/g) || [];
  const h1Count = (content.match(/^#\s+.+/gm) || []).length;
  const h2Count = (content.match(/^##\s+.+/gm) || []).length;

  // Link analysis
  const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  const externalLinks = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    keywordDensity: +keywordDensity.toFixed(2),
    keywordCount: keywordMatches.length,
    readabilityScore: +readabilityScore.toFixed(1),
    headingStructure: {
      total: headings.length,
      h1: h1Count,
      h2: h2Count,
      hasProperStructure: h1Count === 1 && h2Count >= 2
    },
    linkProfile: {
      internal: internalLinks,
      external: externalLinks,
      total: internalLinks + externalLinks
    },
    contentQuality: {
      avgWordsPerSentence: +avgWordsPerSentence.toFixed(1),
      avgSentencesPerParagraph: +(sentences.length / paragraphs.length).toFixed(1)
    }
  };
}

function generateFallbackOptimization(targetKeyword: string, contentType: string) {
  return {
    keywordOptimization: {
      density: 2.5,
      recommendations: [
        `Include "${targetKeyword}" in the first 100 words`,
        `Use "${targetKeyword}" in at least one H2 heading`,
        `Include LSI keywords related to ${targetKeyword}`,
        `Maintain keyword density between 1-3%`
      ]
    },
    contentStructure: {
      headings: [
        `What is ${targetKeyword}?`,
        `Benefits of ${targetKeyword}`,
        `How to implement ${targetKeyword}`,
        `Best practices for ${targetKeyword}`,
        `Common mistakes with ${targetKeyword}`
      ],
      sections: [
        'Introduction with target keyword',
        'Problem definition',
        'Solution explanation',
        'Step-by-step guide',
        'Tips and best practices',
        'Conclusion with call-to-action'
      ]
    },
    readability: {
      score: 65,
      improvements: [
        'Use shorter sentences (15-20 words)',
        'Break up long paragraphs',
        'Add bullet points and lists',
        'Use transition words',
        'Include subheadings every 300 words'
      ]
    },
    seoElements: {
      titleSuggestions: [
        `Complete Guide to ${targetKeyword} in 2024`,
        `How to Master ${targetKeyword}: Expert Tips`,
        `${targetKeyword}: Everything You Need to Know`
      ],
      metaDescriptions: [
        `Learn everything about ${targetKeyword} with our comprehensive guide. Get expert tips, best practices, and actionable strategies.`,
        `Master ${targetKeyword} with our step-by-step guide. Discover proven techniques and avoid common mistakes.`,
        `Complete ${targetKeyword} tutorial with practical examples. Start implementing today with our expert guidance.`
      ],
      snippetOptimization: [
        'Use numbered lists for step-by-step processes',
        'Include FAQ section for voice search',
        'Add summary boxes for key points'
      ]
    },
    contentGaps: [
      `Examples of ${targetKeyword} in action`,
      `Tools and resources for ${targetKeyword}`,
      `Measuring success with ${targetKeyword}`,
      `Future trends in ${targetKeyword}`
    ],
    competitorAnalysis: {
      commonTopics: [
        'Basic definitions and concepts',
        'Step-by-step tutorials',
        'Best practices and tips',
        'Common challenges'
      ],
      uniqueAngles: [
        'Industry-specific applications',
        'Advanced techniques',
        'Case studies and examples',
        'Tool comparisons'
      ]
    }
  };
}

function calculateSEOScore(analysis: any, optimization: any): number {
  let score = 50; // Base score

  // Word count optimization
  if (analysis.wordCount >= 1000 && analysis.wordCount <= 3000) score += 15;
  else if (analysis.wordCount >= 500) score += 10;

  // Keyword density optimization
  if (analysis.keywordDensity >= 1 && analysis.keywordDensity <= 3) score += 15;
  else if (analysis.keywordDensity > 0) score += 5;

  // Heading structure
  if (analysis.headingStructure.hasProperStructure) score += 10;
  else if (analysis.headingStructure.total > 0) score += 5;

  // Readability
  if (analysis.readabilityScore >= 60) score += 10;
  else if (analysis.readabilityScore >= 30) score += 5;

  // Link profile
  if (analysis.linkProfile.total >= 3) score += 5;

  return Math.min(100, Math.max(0, score));
}

function generateActionableSteps(analysis: any, optimization: any): string[] {
  const steps = [];

  if (analysis.keywordDensity < 1) {
    steps.push('Increase keyword density by naturally incorporating target keyword');
  }
  if (analysis.keywordDensity > 4) {
    steps.push('Reduce keyword density to avoid over-optimization');
  }
  if (!analysis.headingStructure.hasProperStructure) {
    steps.push('Improve heading structure with one H1 and multiple H2s');
  }
  if (analysis.wordCount < 800) {
    steps.push('Expand content to at least 800-1000 words');
  }
  if (analysis.readabilityScore < 50) {
    steps.push('Improve readability with shorter sentences and simpler words');
  }
  if (analysis.linkProfile.total < 3) {
    steps.push('Add relevant internal and external links');
  }

  return steps;
}

function prioritizeOptimizations(analysis: any, optimization: any) {
  const priorities = {
    high: [],
    medium: [],
    low: []
  };

  if (analysis.keywordDensity === 0) {
    priorities.high.push('Add target keyword to content');
  }
  if (!analysis.headingStructure.h1) {
    priorities.high.push('Add H1 heading');
  }
  if (analysis.wordCount < 500) {
    priorities.high.push('Increase content length');
  }
  if (analysis.keywordDensity > 5) {
    priorities.medium.push('Reduce keyword stuffing');
  }
  if (analysis.readabilityScore < 40) {
    priorities.medium.push('Improve readability');
  }
  if (analysis.linkProfile.total === 0) {
    priorities.medium.push('Add relevant links');
  }

  priorities.low.push('Add LSI keywords');
  priorities.low.push('Optimize for featured snippets');

  return priorities;
}