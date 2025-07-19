
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, FileText, Eye, Search } from 'lucide-react';

interface ATSCheckResult {
  score: number;
  compatibility: 'excellent' | 'good' | 'needs_work';
  formatIssues: string[];
  recommendations: string[];
  keywordDensity: number;
  readabilityScore: number;
}

interface ATSCheckCardProps {
  result: ATSCheckResult;
}

export const ATSCheckCard: React.FC<ATSCheckCardProps> = ({ result }) => {
  const getStatusIcon = () => {
    switch (result.compatibility) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (result.compatibility) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          ATS Compatibility Check
          <Badge variant="secondary" className="ml-auto">
            {result.score}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>ATS Compatibility Score</span>
            <span className="font-medium">{result.score}%</span>
          </div>
          <Progress value={result.score} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Keyword Density</span>
            </div>
            <div className="text-2xl font-bold">{result.keywordDensity}%</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Readability</span>
            </div>
            <div className="text-2xl font-bold">{result.readabilityScore}/10</div>
          </div>
        </div>

        {/* Format Issues */}
        {result.formatIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Format Issues Found:</h4>
            <ul className="space-y-1">
              {result.formatIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600">ATS Optimization Tips:</h4>
          <ul className="space-y-1">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
