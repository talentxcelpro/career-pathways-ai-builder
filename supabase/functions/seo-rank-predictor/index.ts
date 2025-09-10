import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RankPredictionRequest {
  url: string;
  targetKeyword: string;
  currentRank?: number;
  competitorData?: {
    url: string;
    rank: number;
    domainAuthority: number;
  }[];
  contentLength?: number;
  backlinks?: number;
  domainAge?: number;
}

interface MLPredictionResult {
  success: boolean;
  prediction?: {
    predictedRank: number;
    confidence: number;
    timeframe: string;
    factors: {
      contentQuality: number;
      technicalSEO: number;
      backlinks: number;
      userExperience: number;
      competition: number;
    };
    recommendations: string[];
    riskFactors: string[];
  };
  error?: string;
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
      url,
      targetKeyword,
      currentRank = 50,
      competitorData = [],
      contentLength = 800,
      backlinks = 10,
      domainAge = 1
    }: RankPredictionRequest = await req.json();

    console.log(`🔮 Predicting rank for: ${url} targeting "${targetKeyword}"`);

    // Advanced ML-style analysis using AI
    const analysisPrompt = `You are an advanced SEO machine learning model that predicts search engine rankings. Analyze the following data and provide a comprehensive ranking prediction.

URL: ${url}
Target Keyword: ${targetKeyword}
Current Rank: ${currentRank}
Content Length: ${contentLength} words
Backlinks: ${backlinks}
Domain Age: ${domainAge} years

Competitor Analysis:
${competitorData.map(comp => `- ${comp.url}: Rank ${comp.rank}, DA ${comp.domainAuthority}`).join('\n')}

Using advanced SEO factors including:
- Content quality and relevance
- Technical SEO optimization
- Backlink profile quality
- User experience signals
- Competition analysis
- Algorithm update trends

Provide a JSON response with:
{
  "predictedRank": number (1-100),
  "confidence": number (0-100),
  "timeframe": "3-6 months",
  "factors": {
    "contentQuality": number (0-100),
    "technicalSEO": number (0-100),
    "backlinks": number (0-100),
    "userExperience": number (0-100),
    "competition": number (0-100)
  },
  "recommendations": ["specific actionable recommendations"],
  "riskFactors": ["potential ranking risks"]
}`;

    let response;
    let data;
    let aiProvider = 'OpenAI';

    // Try OpenAI first
    if (openAIApiKey) {
      try {
        console.log(`🔄 Attempting rank prediction with OpenAI...`);
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'o3-2025-04-16', // Using reasoning model for complex analysis
            messages: [
              {
                role: 'system',
                content: 'You are an expert SEO analyst with deep knowledge of ranking factors and algorithm patterns. Provide data-driven predictions based on comprehensive SEO analysis.'
              },
              { role: 'user', content: analysisPrompt }
            ],
            max_completion_tokens: 2000,
            response_format: { type: "json_object" }
          }),
        });

        if (response.ok) {
          data = await response.json();
          console.log(`✅ OpenAI successful for rank prediction`);
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
                {
                  role: 'system',
                  content: 'You are an expert SEO analyst with deep knowledge of ranking factors and algorithm patterns. Provide data-driven predictions based on comprehensive SEO analysis.'
                },
                { role: 'user', content: analysisPrompt }
              ],
              max_tokens: 2000,
              temperature: 0.3,
              response_format: { type: "json_object" }
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API error:', errorText);
            throw new Error(`Both OpenAI and DeepSeek failed. DeepSeek error: ${response.status}`);
          }

          data = await response.json();
          console.log(`✅ DeepSeek fallback successful for rank prediction`);
        } else {
          throw openAIError;
        }
      }
    } else if (deepSeekApiKey) {
      // Use DeepSeek directly if OpenAI key not available
      aiProvider = 'DeepSeek';
      console.log(`🔄 Using DeepSeek directly for rank prediction...`);
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepSeekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert SEO analyst with deep knowledge of ranking factors and algorithm patterns. Provide data-driven predictions based on comprehensive SEO analysis.'
            },
            { role: 'user', content: analysisPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.3,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      data = await response.json();
      console.log(`✅ DeepSeek successful for rank prediction`);
    }
    const prediction = JSON.parse(data.choices[0].message.content);

    // Enhanced prediction with additional ML-style calculations
    const enhancedPrediction = {
      ...prediction,
      // Add keyword difficulty calculation
      keywordDifficulty: calculateKeywordDifficulty(targetKeyword, competitorData),
      // Add ranking probability distribution
      rankingProbability: {
        top3: Math.max(0, 95 - prediction.predictedRank * 3),
        top10: Math.max(0, 80 - prediction.predictedRank * 2),
        top20: Math.max(0, 60 - prediction.predictedRank)
      },
      // Add competitive analysis
      competitiveAdvantage: analyzeCompetitivePosition(currentRank, competitorData),
      // Add seasonal trends
      seasonalTrends: generateSeasonalInsights(targetKeyword),
      // Add algorithm risk assessment
      algorithmRisk: assessAlgorithmRisk(url, prediction.factors),
      // Track AI provider used
      aiProvider,
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Rank prediction completed using ${aiProvider}. Predicted rank: ${prediction.predictedRank}`);

    const result: MLPredictionResult = {
      success: true,
      prediction: enhancedPrediction
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('SEO Rank Predictor error:', error);
    
    const errorResponse: MLPredictionResult = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateKeywordDifficulty(keyword: string, competitors: any[]): number {
  // Simulated keyword difficulty calculation
  const baseScore = keyword.length > 15 ? 30 : 50;
  const competitorFactor = Math.min(competitors.length * 5, 40);
  return Math.min(baseScore + competitorFactor, 95);
}

function analyzeCompetitivePosition(currentRank: number, competitors: any[]): string {
  if (currentRank <= 10) return 'Strong - Top 10 position';
  if (currentRank <= 20) return 'Good - Page 1 potential';
  if (currentRank <= 50) return 'Moderate - Needs improvement';
  return 'Weak - Significant optimization required';
}

function generateSeasonalInsights(keyword: string): any {
  // Simulated seasonal analysis
  const seasonal = ['holiday', 'christmas', 'summer', 'winter', 'back to school'];
  const hasSeasonal = seasonal.some(term => keyword.toLowerCase().includes(term));
  
  return {
    isSeasonalKeyword: hasSeasonal,
    peakMonths: hasSeasonal ? ['November', 'December'] : null,
    recommendation: hasSeasonal ? 'Optimize before peak season' : 'Year-round optimization strategy'
  };
}

function assessAlgorithmRisk(url: string, factors: any): string {
  const totalScore = Object.values(factors).reduce((sum: number, score: any) => sum + score, 0) / Object.keys(factors).length;
  
  if (totalScore >= 80) return 'Low - Well-optimized for algorithm updates';
  if (totalScore >= 60) return 'Medium - Monitor for algorithm changes';
  return 'High - Vulnerable to algorithm updates';
}