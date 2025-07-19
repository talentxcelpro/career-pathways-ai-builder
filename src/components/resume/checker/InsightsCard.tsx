
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, Award, Briefcase, Star } from 'lucide-react';

interface MarketInsights {
  industryBenchmark: {
    averageScore: number;
    topPercentile: number;
    yourRanking: string;
  };
  competitiveAnalysis: {
    strengths: string[];
    gaps: string[];
    opportunities: string[];
  };
  trendsAnalysis: {
    hotSkills: string[];
    emergingKeywords: string[];
    industryTrends: string[];
  };
  recommendations: Array<{
    category: string;
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'moderate' | 'challenging';
  }>;
}

interface InsightsCardProps {
  insights: MarketInsights;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Market Insights & Recommendations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Industry Benchmark */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-emerald-600" />
            <h4 className="font-medium text-emerald-800">Industry Benchmark</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {insights.industryBenchmark.averageScore}%
              </div>
              <div className="text-sm text-gray-600">Industry Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insights.industryBenchmark.topPercentile}%
              </div>
              <div className="text-sm text-gray-600">Top 10%</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {insights.industryBenchmark.yourRanking}
              </div>
              <div className="text-sm text-gray-600">Your Ranking</div>
            </div>
          </div>
        </div>

        {/* Competitive Analysis */}
        <div className="space-y-4">
          <h4 className="font-medium text-blue-600 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Competitive Analysis
          </h4>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-green-600 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Your Strengths
              </h5>
              <div className="flex flex-wrap gap-2">
                {insights.competitiveAnalysis.strengths.map((strength, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-red-600">Competitive Gaps</h5>
              <div className="flex flex-wrap gap-2">
                {insights.competitiveAnalysis.gaps.map((gap, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                    {gap}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trends Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-purple-600 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Industry Trends & Hot Skills
          </h4>
          
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Trending Skills in Your Industry:</h5>
              <div className="flex flex-wrap gap-2">
                {insights.trendsAnalysis.hotSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                    🔥 {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Emerging Keywords:</h5>
              <div className="flex flex-wrap gap-2">
                {insights.trendsAnalysis.emergingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    ⭐ {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-indigo-600 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Recommended Actions
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm">{rec.category}</div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(rec.impact)} variant="secondary">
                      {rec.impact} impact
                    </Badge>
                    <Badge className={getEffortColor(rec.effort)} variant="secondary">
                      {rec.effort}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Market Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <h5 className="font-medium text-purple-800 mb-2">Market Intelligence Tips:</h5>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Stay updated with industry-specific trends and technologies</li>
            <li>• Network with professionals in your target companies</li>
            <li>• Continuously update skills based on market demand</li>
            <li>• Monitor job postings to identify recurring requirements</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
