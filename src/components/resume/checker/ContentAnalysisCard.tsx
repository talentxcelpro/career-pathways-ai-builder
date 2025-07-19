
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap, BarChart3, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

interface ContentAnalysis {
  overallScore: number;
  impactScore: number;
  quantificationLevel: number;
  actionVerbUsage: number;
  accomplishmentFocus: number;
  suggestions: Array<{
    type: 'improvement' | 'addition' | 'revision';
    section: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  strengths: string[];
  weaknesses: string[];
}

interface ContentAnalysisCardProps {
  analysis: ContentAnalysis;
}

export const ContentAnalysisCard: React.FC<ContentAnalysisCardProps> = ({ analysis }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <Zap className="h-4 w-4" />;
      case 'addition':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-500" />
          Content Analysis
          <Badge variant="secondary" className="ml-auto">
            {analysis.overallScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Content Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Impact Score</span>
            </div>
            <Progress value={analysis.impactScore} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.impactScore}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Quantification</span>
            </div>
            <Progress value={analysis.quantificationLevel} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.quantificationLevel}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Action Verbs</span>
            </div>
            <Progress value={analysis.actionVerbUsage} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.actionVerbUsage}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Accomplishments</span>
            </div>
            <Progress value={analysis.accomplishmentFocus} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.accomplishmentFocus}%</span>
          </div>
        </div>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Content Strengths
            </h4>
            <div className="space-y-1">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Suggestions */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Content Improvements
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analysis.suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {getTypeIcon(suggestion.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{suggestion.section}</span>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h5 className="font-medium text-purple-800 mb-2">Content Enhancement Tips:</h5>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Start bullet points with strong action verbs</li>
            <li>• Include specific numbers, percentages, and metrics</li>
            <li>• Focus on achievements rather than responsibilities</li>
            <li>• Use industry-specific terminology appropriately</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
