import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateJSONWithFallback } from "../_shared/ai-fallback.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const systemPrompt = 'You are an expert SEO analyst with deep knowledge of ranking factors and algorithm patterns. Provide data-driven predictions based on comprehensive SEO analysis.';
    
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

    // Use AI fallback for rank prediction
    const aiResult = await generateJSONWithFallback(
      systemPrompt,
      analysisPrompt,
      {
        model: 'o3-2025-04-16', // Using reasoning model for complex analysis
        maxTokens: 2000,
        temperature: 0.3
      }
    );

    const prediction = aiResult.data;

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
      aiProvider: aiResult.provider,
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Rank prediction completed using ${aiResult.provider}. Predicted rank: ${prediction.predictedRank}`);

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