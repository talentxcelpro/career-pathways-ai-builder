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
    const { seedKeyword, industry = 'general', location = 'global' } = await req.json();
    
    if (!seedKeyword) {
      throw new Error('Seed keyword is required');
    }

    console.log(`Researching keywords for: ${seedKeyword}, industry: ${industry}, location: ${location}`);

    // Generate keyword variations using AI
    const prompt = `You are an SEO expert. Generate a comprehensive keyword research report for the seed keyword "${seedKeyword}" in the ${industry} industry for ${location} market.

Please provide:
1. 20 related keywords with their estimated monthly search volume (realistic numbers)
2. Keyword difficulty score (0-100)
3. Search intent (informational, navigational, commercial, transactional)
4. CPC estimates in USD
5. Long-tail keyword variations
6. "People also ask" questions
7. Seasonal trends (if applicable)

Format the response as a JSON object with the following structure:
{
  "keywords": [
    {
      "keyword": "string",
      "volume": number,
      "difficulty": number,
      "cpc": number,
      "intent": "string",
      "trend": "up|down|stable",
      "competition": "low|medium|high"
    }
  ],
  "longTail": ["array of long-tail keywords"],
  "questions": ["array of PAA questions"],
  "clusters": [
    {
      "theme": "string",
      "keywords": ["array"],
      "totalVolume": number
    }
  ],
  "seasonality": {
    "isSeasonalKeyword": boolean,
    "peakMonths": ["array of months if seasonal"]
  }
}

Make the data realistic and industry-appropriate.`;

    // Call OpenAI API
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
            content: 'You are an expert SEO researcher with access to comprehensive keyword databases. Provide realistic and actionable keyword research data.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    let keywordData;

    try {
      keywordData = JSON.parse(aiData.choices[0].message.content);
    } catch (parseError) {
      // Fallback if AI response isn't valid JSON
      console.warn('AI response parsing failed, using fallback data');
      keywordData = generateFallbackKeywordData(seedKeyword);
    }

    // Enhance with additional SEO metrics
    const enhancedData = {
      ...keywordData,
      seedKeyword,
      industry,
      location,
      totalKeywords: keywordData.keywords?.length || 0,
      averageDifficulty: keywordData.keywords?.reduce((acc: number, kw: any) => acc + kw.difficulty, 0) / (keywordData.keywords?.length || 1),
      totalSearchVolume: keywordData.keywords?.reduce((acc: number, kw: any) => acc + kw.volume, 0) || 0,
      competitorKeywords: generateCompetitorKeywords(seedKeyword),
      relatedTopics: generateRelatedTopics(seedKeyword, industry),
      contentIdeas: generateContentIdeas(seedKeyword, industry),
      timestamp: new Date().toISOString()
    };

    console.log(`Generated ${enhancedData.totalKeywords} keywords for "${seedKeyword}"`);

    return new Response(JSON.stringify(enhancedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Keyword research error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackKeywordData(seedKeyword: string) {
  const variations = [
    `${seedKeyword} online`,
    `${seedKeyword} free`,
    `${seedKeyword} tool`,
    `${seedKeyword} software`,
    `${seedKeyword} app`,
    `${seedKeyword} service`,
    `${seedKeyword} platform`,
    `${seedKeyword} website`,
    `${seedKeyword} guide`,
    `${seedKeyword} tips`,
    `best ${seedKeyword}`,
    `top ${seedKeyword}`,
    `how to ${seedKeyword}`,
    `${seedKeyword} tutorial`,
    `${seedKeyword} examples`
  ];

  return {
    keywords: variations.map((kw, index) => ({
      keyword: kw,
      volume: Math.floor(Math.random() * 50000) + 1000,
      difficulty: Math.floor(Math.random() * 80) + 20,
      cpc: +(Math.random() * 5 + 0.5).toFixed(2),
      intent: ['informational', 'commercial', 'transactional'][Math.floor(Math.random() * 3)],
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    })),
    longTail: [
      `how to use ${seedKeyword} effectively`,
      `best ${seedKeyword} for beginners`,
      `${seedKeyword} vs alternatives comparison`,
      `free ${seedKeyword} tools and resources`
    ],
    questions: [
      `What is ${seedKeyword}?`,
      `How does ${seedKeyword} work?`,
      `What are the benefits of ${seedKeyword}?`,
      `How much does ${seedKeyword} cost?`
    ],
    clusters: [
      {
        theme: `${seedKeyword} Tools`,
        keywords: variations.slice(0, 5),
        totalVolume: 150000
      },
      {
        theme: `${seedKeyword} Learning`,
        keywords: variations.slice(5, 10),
        totalVolume: 89000
      }
    ],
    seasonality: {
      isSeasonalKeyword: false,
      peakMonths: []
    }
  };
}

function generateCompetitorKeywords(seedKeyword: string) {
  return [
    `${seedKeyword} alternative`,
    `${seedKeyword} competitor`,
    `${seedKeyword} vs`,
    `better than ${seedKeyword}`,
    `${seedKeyword} comparison`
  ];
}

function generateRelatedTopics(seedKeyword: string, industry: string) {
  const topics = [
    `${industry} automation`,
    `${industry} optimization`,
    `${industry} best practices`,
    `${industry} trends 2024`,
    `${industry} tools`
  ];
  
  return topics.filter(topic => !topic.includes(seedKeyword));
}

function generateContentIdeas(seedKeyword: string, industry: string) {
  return [
    `Complete Guide to ${seedKeyword}`,
    `10 Best ${seedKeyword} Strategies for ${industry}`,
    `${seedKeyword} Case Studies and Success Stories`,
    `Common ${seedKeyword} Mistakes to Avoid`,
    `Future of ${seedKeyword} in ${industry}`
  ];
}