import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Lightbulb,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ATSAnalysisResult } from '@/hooks/useRealTimeATS';
import { motion } from 'framer-motion';

interface RealTimeATSScoreProps {
  analysis: ATSAnalysisResult | null;
  isAnalyzing: boolean;
  onOptimize?: () => void;
}

export const RealTimeATSScore: React.FC<RealTimeATSScoreProps> = ({
  analysis,
  isAnalyzing,
  onOptimize
}) => {
  if (!analysis && !isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            ATS Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Start editing your resume to see real-time ATS analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            Analyzing ATS Compatibility...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-2 bg-muted rounded mb-4"></div>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const getTrafficLightColor = (status: 'red' | 'yellow' | 'green') => {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`border-2 ${getTrafficLightColor(analysis.trafficLight)}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ATS Compatibility Score
              </span>
              <Badge 
                variant={analysis.trafficLight === 'green' ? 'default' : 'secondary'}
                className={getTrafficLightColor(analysis.trafficLight)}
              >
                {analysis.trafficLight.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              
              <div className="flex-1 mx-6">
                <Progress 
                  value={analysis.overallScore} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-1 text-sm">
                  {analysis.overallScore >= 80 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-muted-foreground">
                    {analysis.overallScore >= 80 ? 'Excellent' : 'Can Improve'}
                  </span>
                </div>
              </div>
            </div>

            {onOptimize && (
              <Button 
                onClick={onOptimize}
                className="w-full"
                variant={analysis.trafficLight === 'green' ? 'outline' : 'default'}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {analysis.trafficLight === 'green' ? 'Fine-tune Further' : 'Optimize Now'}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Section Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analysis.sections).map(([sectionName, sectionData]) => (
              <motion.div
                key={sectionName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    sectionData.status === 'green' ? 'bg-green-500' :
                    sectionData.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="font-medium capitalize">
                      {sectionName.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    {sectionData.issues.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>{sectionData.issues.length} issue{sectionData.issues.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {sectionData.suggestions.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <Lightbulb className="h-3 w-3" />
                        <span>{sectionData.suggestions.length} suggestion{sectionData.suggestions.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getScoreColor(sectionData.score)}`}>
                    {sectionData.score}%
                  </div>
                  <Progress 
                    value={sectionData.score} 
                    className="w-20 h-2"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Keyword Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.keywords.matched.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Matched Keywords ({analysis.keywords.matched.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.matched.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.keywords.missing.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Missing Keywords ({analysis.keywords.missing.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.missing.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-50 text-red-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.keywords.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommended Keywords ({analysis.keywords.recommendations.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.recommendations.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Fixes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Quick Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analysis.sections)
              .filter(([, sectionData]) => sectionData.suggestions.length > 0)
              .slice(0, 3)
              .map(([sectionName, sectionData], index) => (
                <motion.div
                  key={sectionName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <ArrowUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium capitalize text-sm">
                      {sectionName.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {sectionData.suggestions[0]}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};