
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Search, Target, AlertCircle } from 'lucide-react';

interface KeywordAnalysis {
  matchedKeywords: Array<{
    keyword: string;
    frequency: number;
    importance: 'high' | 'medium' | 'low';
  }>;
  missingKeywords: Array<{
    keyword: string;
    importance: 'high' | 'medium' | 'low';
    suggestions: string[];
  }>;
  overallMatch: number;
  industryRelevance: number;
}

interface KeywordsAnalysisCardProps {
  analysis: KeywordAnalysis;
}

export const KeywordsAnalysisCard: React.FC<KeywordsAnalysisCardProps> = ({ analysis }) => {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          Keywords Analysis
          <Badge variant="secondary" className="ml-auto">
            {analysis.overallMatch}% Match
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Keyword Match</span>
            </div>
            <Progress value={analysis.overallMatch} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.overallMatch}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Industry Relevance</span>
            </div>
            <Progress value={analysis.industryRelevance} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.industryRelevance}%</span>
          </div>
        </div>

        {/* Matched Keywords */}
        <div className="space-y-3">
          <h4 className="font-medium text-green-600 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Found Keywords ({analysis.matchedKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matchedKeywords.map((keyword, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className={`${getImportanceColor(keyword.importance)} text-xs`}
              >
                {keyword.keyword} ({keyword.frequency}x)
              </Badge>
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        {analysis.missingKeywords.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Missing Important Keywords
            </h4>
            <div className="space-y-2">
              {analysis.missingKeywords.slice(0, 5).map((missing, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-red-800">{missing.keyword}</span>
                    <Badge className={getImportanceColor(missing.importance)} variant="secondary">
                      {missing.importance} priority
                    </Badge>
                  </div>
                  <div className="text-xs text-red-600">
                    Suggestions: {missing.suggestions.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2">Keyword Optimization Tips:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Include high-priority keywords in your summary and experience sections</li>
            <li>• Use variations of important keywords naturally throughout your resume</li>
            <li>• Match the exact terms used in job descriptions when possible</li>
            <li>• Avoid keyword stuffing - maintain natural readability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
